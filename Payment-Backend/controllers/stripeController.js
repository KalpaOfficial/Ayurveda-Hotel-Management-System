import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import CheckoutContext from '../models/CheckoutContext.js';

let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return stripe;
};

// NEW: create checkout directly from booking (no /pay page)
export const checkoutFromBooking = async (req, res) => {
  try {
    const stripe = getStripe();
    const { name, email, amount, packageType, bookingData } = req.body;

    console.log('=== BOOKING CHECKOUT DEBUG ===');
    console.log('Request data:', { name, email, amount, packageType });
    console.log('Amount in USD:', Number(amount));
    console.log('Amount in cents for Stripe:', Math.round(Number(amount) * 100));
    console.log('Customer email for prefill:', email);
    console.log('Currency: USD');

    if (!name || !email || !amount || !packageType || !bookingData) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Create local pending record
    const payment = await Payment.create({
      name,
      email: email.toLowerCase(),
      amount: Number(amount),
      packageType,
      status: 'Pending',
    });

    // Create a short-lived server context for booking
    const token = crypto.randomBytes(16).toString('hex');
    await CheckoutContext.create({
      token,
      type: 'booking', // Explicitly set type
      name,
      email: email.toLowerCase(),
      amount: Number(amount),
      packageType,
      bookingData,
      status: 'Init',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email, // Pre-fill customer email
      locale: 'en', // Force English locale to avoid currency detection
      metadata: {
        paymentId: payment._id.toString(),
        token,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: packageType || 'Sath Villa Package' },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      // Redirect to Sath Villa success page after payment
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&t=${token}`,
      // If cancelled, send them back to Sath Villa add_booking
      cancel_url: `http://localhost:3000/add_booking?canceled=1`,
    });

    return res.json({ url: session.url });
  } catch (e) {
    console.error('checkoutFromBooking error:', e);
    return res.status(500).json({ message: 'Failed to start checkout' });
  }
};

// --- New: Cart → Stripe Checkout (no /pay page)
export const checkoutFromCart = async (req, res) => {
  try {
    console.log('=== checkoutFromCart called ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const stripe = getStripe();
    const {
      name,
      email,
      cart = [],
      currency = 'usd',
      rate, // optional (LKR→USD). If not provided, we use env
    } = req.body || {};

    console.log('Parsed data:', { name, email, cartLength: cart.length, currency, rate });

    if (!name || !email || !Array.isArray(cart) || cart.length === 0) {
      console.log('Validation failed:', { name: !!name, email: !!email, isArray: Array.isArray(cart), cartLength: cart.length });
      return res.status(400).json({ message: 'Missing name/email or empty cart' });
    }

    const LKR_TO_USD = Number(process.env.LKR_TO_USD || 0.0033); // adjustable
    const fx = (typeof rate === 'number' && rate > 0) ? rate : LKR_TO_USD;

    // Compute total - if currency is already USD, don't convert again
    const totalCartAmount = cart.reduce((s, i) => s + Number(i.p_price || 0) * Number(i.quantity || 0), 0);
    const totalUsd = currency.toLowerCase() === 'usd'
      ? Number(totalCartAmount.toFixed(2)) // already in USD, no conversion needed
      : Number((totalCartAmount * fx).toFixed(2)); // convert LKR to USD

    // 1) local pending record
    const payment = await Payment.create({
      name,
      email: email.toLowerCase(),
      amount: totalUsd,
      packageType: `Cart (${cart.length} items)`,
      status: 'Pending',
    });

    // 2) short-lived context for success page receipt
    const token = crypto.randomBytes(16).toString('hex');
    await CheckoutContext.create({
      token,
      type: 'cart',
      name,
      email: email.toLowerCase(),
      amount: totalUsd,
      packageType: `Cart (${cart.length} items)`,
      cart,
      status: 'Init',
    });

    // 3) Stripe line items (handle USD correctly)
    const line_items = cart.map((i) => {
      // If currency is already USD, don't convert again
      const unitUSD = currency.toLowerCase() === 'usd'
        ? Number(i.p_price || 0)  // already in USD
        : Number((Number(i.p_price) * fx).toFixed(2)); // convert from LKR to USD
      
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: i.p_name || 'Product' },
          unit_amount: Math.round(unitUSD * 100), // convert to cents
        },
        quantity: Number(i.quantity) || 1,
      };
    });

    // 4) Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: { paymentId: payment._id.toString(), token },
      line_items,
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&t=${token}`,
      cancel_url: `http://localhost:3000/cart?canceled=1`,
    });

    return res.json({ url: session.url });
  } catch (e) {
    console.error('checkoutFromCart error details:', e);
    console.error('Error stack:', e.stack);
    return res.status(500).json({ message: 'Failed to start checkout', error: e.message });
  }
};


export const confirmCheckout = async (req, res) => {
  try {
    const stripe = getStripe();
    const { session_id, t } = req.query;     // note: t = token
    if (!session_id) return res.status(400).json({ message: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paymentId = session.metadata?.paymentId;
    const token     = session.metadata?.token || t || '';

    if (!paymentId) return res.status(400).json({ message: 'Missing paymentId metadata' });

    if (session.payment_status === 'paid') {
      const updated = await Payment.findByIdAndUpdate(
        paymentId,
        {
          status: 'Paid',
          transactionId: session.payment_intent || session.id,
          paymentDate: new Date(),
        },
        { new: true }
      );

      // get context + create booking in Sath Villa or handle cart
      let bookingData = null;
      let cart = null;
      if (token) {
        try {
          const ctx = await CheckoutContext.findOne({ token });
          if (ctx && ctx.status !== 'Paid') {
            if (ctx.type === 'cart') {
              cart = ctx.cart || null;
            } else { // booking
              bookingData = ctx?.bookingData || null;
              if (bookingData) {
                 await axios.post(`${process.env.SATH_BACKEND_URL || 'http://localhost:5000'}/bookings`, bookingData, {
                   headers: { 'Content-Type': 'application/json' }
                 });
              }
            }
            await CheckoutContext.updateOne({ token }, { status: 'Paid' });
          } else if (ctx) { // already paid, just get the data
            if (ctx.type === 'cart') {
              cart = ctx.cart || null;
            } else {
              bookingData = ctx?.bookingData || null;
            }
          }
        } catch (err) {
          console.error('Context read/post failed:', err?.response?.data || err.message);
        }
      }

      const body = updated?.toObject ? updated.toObject() : updated;
      return res.json({ ...body, booking: bookingData, cart });
    }

    // still pending
    const pending = await Payment.findById(paymentId);
    return res.json(pending);
  } catch (e) {
    console.error('Stripe confirm error:', e);
    return res.status(500).json({ message: 'Failed to confirm payment' });
  }
};