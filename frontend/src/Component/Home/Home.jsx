import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "../Home/Home.css";
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaLeaf, 
  FaHeart, 
  FaSpa, 
  FaOm, 
  FaStar,
  FaArrowRight,
  FaClock,
  FaUtensils,
  FaSwimmingPool,
  FaTree,
  FaWind
} from "react-icons/fa";

// images
import heroImage from "../Home/frontview.jpg";
import package1 from "../Home/garden.jpg";
import package2 from "../Home/flowerbath.jpg";
import package3 from "../Home/welcomeayu.jpg";
import package4 from "../Home/gardenjuice.jpg";

const sliderImages = [package1, package2, package3, package4];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [myInquiries, setMyInquiries] = useState([]);
  const [topReviews, setTopReviews] = useState([]);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
    if (u && u._id) {
      fetch(`${API_BASE}/inquiries/user/${u._id}/all`)
        .then(res => res.ok ? res.json() : { inquiries: [] })
        .then(data => setMyInquiries(data.inquiries || []))
        .catch(() => setMyInquiries([]));
    }
    // Load latest 3 five-star reviews
    fetch(`${API_BASE}/reviews/top/five-star/latest`)
      .then(res => res.ok ? res.json() : { reviews: [] })
      .then(data => setTopReviews(data.reviews || []))
      .catch(() => setTopReviews([]));
  }, []);

  return (
    <div className="home-container">
      <Nav />

      {/* Photo Slider */}
      <section className="slider-section">
        {sliderImages.map((img, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          >
            <img src={img} alt={`Slide ${index + 1}`} />
          </div>
        ))}
        <div className="slider-dots">
          {sliderImages.map((_, index) => (
            <span
              key={index}
              className={index === currentIndex ? "dot active-dot" : "dot"}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
        
      </section>

    
<section className="contact-tab">
  <a href="https://maps.app.goo.gl/jpqX7kbArh77X5D5A" target="_blank" rel="noreferrer" className="contact-box">
    <FaMapMarkerAlt className="icon" />
    <p>No 52/10, 5th Lane, Moragalla, Beruwala</p>
  </a>
  <a href="tel:+94777894776" className="contact-box">
    <FaPhoneAlt className="icon" />
    <p>+94 777 89 4776</p>
  </a>
  <a href="mailto:sathvilla@gmail.com" className="contact-box">
    <FaEnvelope className="icon" />
    <p>sathvilla@gmail.com</p>
  </a>
</section>

      {/* Hero Section */}
  <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <FaLeaf />
            <span>Authentic Ayurvedic Wellness</span>
          </div>
          <h1>Welcome to Sath Villa Ayurvedic Wellness Resort</h1>
          <p>
            Immerse yourself in traditional Ayurveda treatments in a tranquil
            environment. Begin your wellness journey with our stress relief and
            rejuvenation programs designed to restore your mind, body, and soul.
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <FaHeart />
              <span>Holistic Healing</span>
            </div>
            <div className="feature-item">
              <FaSpa />
              <span>Traditional Therapies</span>
            </div>
            <div className="feature-item">
              <FaOm />
              <span>Mind-Body Balance</span>
            </div>
          </div>
          <div className="hero-actions">
            <a href="/add_booking" className="btn btn-primary">
              <FaLeaf />
              Book Your Stay
              <FaArrowRight />
            </a>
            <a href="/ayurveda" className="btn btn-outline">
              Learn About Ayurveda
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Ayurveda Retreat" />
          <div className="hero-overlay">
            <div className="floating-card">
              <FaStar />
              <span>4.9/5 Guest Rating</span>
            </div>
          </div>
        </div>
  </section>

      {/* About Resort Section */}
<section
  className="about-section"
  style={{ "--bg-image": `url(${package2})` }}
>
  <div className="overlay">
    <h2>Our Resort</h2>
    <p>
      Stay in our modern airy rooms, with high-quality furniture and mouth-watering sea views.Let our friendly and experienced staff take care of all your needs to ensure you feeling right at home with us.
      Sath Villa & Naadi Ayurveda Resort is the perfect setting for your relaxation and an experience for all senses.
      Sath Villa family is eagerly waiting to treat you like a family member. We look forward to spoiling you and are happy to make your Sri Lankan adventure a memorable one!<br/><br/>
      Leave stress, anxiety and unhealthy habits behind and dive into the soothing calm of the Sri Lankan jungle. (Only a 90-minute cab ride from Colombo Int. Airport)
      Feel young and healthy with new emotional strength, improve your physical well-being through Yoga, and restore internal balance with delicious plant-based meals.
      joy our garden and pool or take a dip in the ocean right next to our property.
      Take in our family-like atmosphere, and let our staff treat you to delicious food and drinks. Let us be part of your unforgettable time in Sri Lanka.
      The whole Sath Villa Resort Family is looking forward to welcoming you!
    </p>
  </div>
</section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <div className="section-badge">
            <FaSpa />
            <span>Wellness Services</span>
          </div>
          <h2>Our Holistic Wellness Services</h2>
          <p>Experience authentic Ayurvedic treatments designed to restore balance and promote healing</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FaSpa />
            </div>
            <h3>Panchakarma Therapy</h3>
            <p>Detoxify and rejuvenate your body with traditional Ayurvedic purification methods that cleanse toxins and restore vitality.</p>
            <div className="service-features">
              <span>• Deep Cleansing</span>
              <span>• Herbal Treatments</span>
              <span>• Personalized Care</span>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FaHeart />
            </div>
            <h3>Ayurvedic Massage</h3>
            <p>Relax and relieve stress with therapeutic massages using warm herbal oils and traditional techniques.</p>
            <div className="service-features">
              <span>• Herbal Oils</span>
              <span>• Stress Relief</span>
              <span>• Muscle Relaxation</span>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FaOm />
            </div>
            <h3>Yoga & Meditation</h3>
            <p>Connect mind and body through guided yoga sessions and meditation practices for inner peace and balance.</p>
            <div className="service-features">
              <span>• Daily Sessions</span>
              <span>• Mind-Body Balance</span>
              <span>• Inner Peace</span>
            </div>
          </div>
        </div>
        <div className="section-actions">
          <a href="/services" className="btn btn-primary">
            <FaArrowRight />
            Explore All Services
          </a>
        </div>
      </section>

     {/* About Ayurveda Section */}
<section
  className="about-section"
  style={{ "--bg-image": `url(${package1})` }}
>
  <div className="overlay">
    <h2>What is Ayurveda?</h2>
    <p>
      Ayurveda is a natural way of healing ailments and securing the balance of a healthy life. It promotes physical as well as 
      mental well-being.Ayurveda is a holistic system which guides us so that we can live a healthier and more balanced lifestyle. 
      The wisdom of Ayurveda encourages us to take responsibility for our own health according to the different stages of our lives, 
      the seasons, and the environment we live, work and play in.<br/><br/>
      Ayurveda is considered to be a science of balance and longevity that based on the 
      principle of the three energies called Vata, Pita and Kapha.Ayurveda stresses the use of plant-based medicines and treatments. 
      Hundreds of plant-based medicines are employed in order to control and maintain these three energies.
    </p>
  </div>
</section>


      {/* Packages Section */}
      <section className="packages-section">
        <div className="section-header">
          <div className="section-badge">
            <FaLeaf />
            <span>Wellness Packages</span>
          </div>
          <h2>Featured Wellness Packages</h2>
          <p>Choose from our carefully crafted packages designed for different wellness goals</p>
        </div>
        <div className="packages-grid">
          <div className="package-card">
            <div className="package-image">
              <img src={package1} alt="Detox Package" />
              <div className="package-badge">Most Popular</div>
            </div>
            <div className="package-content">
              <h3>Detox & Rejuvenation</h3>
              <p>7 Days complete body detox program with Panchakarma therapy and herbal treatments.</p>
              <div className="package-features">
                <div className="feature">
                  <FaClock />
                  <span>7 Days</span>
                </div>
                <div className="feature">
                  <FaSpa />
                  <span>Panchakarma</span>
                </div>
                <div className="feature">
                  <FaUtensils />
                  <span>Herbal Meals</span>
                </div>
              </div>
              <div className="package-price">
                <span className="price">From $299</span>
                <span className="duration">per day</span>
              </div>
            </div>
          </div>
          <div className="package-card">
            <div className="package-image">
              <img src={package2} alt="Stress Relief Package" />
            </div>
            <div className="package-content">
              <h3>Stress Relief</h3>
              <p>5 Days of relaxing massages, meditation, and yoga sessions for complete stress relief.</p>
              <div className="package-features">
                <div className="feature">
                  <FaClock />
                  <span>5 Days</span>
                </div>
                <div className="feature">
                  <FaHeart />
                  <span>Massage</span>
                </div>
                <div className="feature">
                  <FaOm />
                  <span>Yoga</span>
                </div>
              </div>
              <div className="package-price">
                <span className="price">From $199</span>
                <span className="duration">per day</span>
              </div>
            </div>
          </div>
          <div className="package-card">
            <div className="package-image">
              <img src={package3} alt="Holistic Package" />
              <div className="package-badge">Premium</div>
            </div>
            <div className="package-content">
              <h3>Holistic Wellness</h3>
              <p>10 Days comprehensive wellness retreat with all Ayurvedic therapies and personalized care.</p>
              <div className="package-features">
                <div className="feature">
                  <FaClock />
                  <span>10 Days</span>
                </div>
                <div className="feature">
                  <FaSpa />
                  <span>All Therapies</span>
                </div>
                <div className="feature">
                  <FaTree />
                  <span>Nature Immersion</span>
                </div>
              </div>
              <div className="package-price">
                <span className="price">From $399</span>
                <span className="duration">per day</span>
              </div>
            </div>
          </div>
        </div>
        <div className="section-actions">
          <a href="/Ayurveda" className="btn btn-primary">
            <FaArrowRight />
            View All Packages
          </a>
        </div>
      </section>

      {/* Therapy Hours Section */}
<section
  className="about-section"
  style={{ "--bg-image": `url(${package3})` }}
>
  <div className="overlay">
    <h2>Therapy Hours</h2>
    <p>
     
Sunday : 8:00am - 21:00pm<br/>
Monday : 8:00am - 21:00pm<br/>
Tuesday : 8:00am - 21:00pm<br/>
Wednesday : 8:00am - 21:00pm<br/>
Thursday : 8:00am - 21:00pm<br/>
Friday : 8:00am - 21:00pm<br/>
Saturday : 8:00am - 21:00pm<br/>
    </p>
    <a href="/about" className="btn-section">Learn More</a>
  </div>
</section>

      {/* Testimonials Section - Latest 3 Five-Star Reviews */}
      <section className="testimonials-section">
        <div className="section-header">
          <div className="section-badge">
            <FaStar />
            <span>Guest Reviews</span>
          </div>
          <h2>What Our Guests Say</h2>
          <p>Real experiences from our wellness journey participants</p>
        </div>
        <div className="testimonials-grid">
          {topReviews.length === 0 ? (
            [0,1,2].map((i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-rating">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <p>"Your relaxing stay could be here soon. Be the first to review!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <span>SV</span>
                  </div>
                  <div className="author-info">
                    <h4>Sath Villa Guest</h4>
                    <span>Sri Lanka</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            topReviews.map((r, idx) => (
              <div className="testimonial-card" key={r._id || idx}>
                <div className="testimonial-rating">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <p>{r.description ? `"${r.description}"` : '"Great experience!"'}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {r.user?.profilePicture ? (
                      <img 
                        src={r.user.profilePicture.startsWith('http') ? r.user.profilePicture : `${API_BASE}${r.user.profilePicture}`}
                        alt="profile" 
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span>{((r.user?.firstName || 'G')[0] + (r.user?.lastName || 'U')[0]).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="author-info">
                    <h4>{`${r.user?.firstName || 'Guest'} ${r.user?.lastName || ''}`.trim()}</h4>
                    <span>{r.user?.country || 'Sri Lanka'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="section-actions">
          <a href="/reviews" className="btn btn-outline">
            View All Reviews
          </a>
          <a href="/reviews?action=add" className="btn btn-primary">
            Give Your Honest Review
          </a>
        </div>
      </section>

      {/* My Inquiry Response (if logged in and exists) */}
      {user && myInquiries.length > 0 && (() => {
        // Find the latest inquiry with a response
        const latestInquiryWithResponse = myInquiries
          .filter(inquiry => inquiry.response && inquiry.response.trim() !== '')
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
        
        return latestInquiryWithResponse && (
        <section className="testimonials-section">
          <div className="section-header">
            <div className="section-badge">
              <FaEnvelope />
              <span>Your Inquiry Response</span>
            </div>
            <h2>Latest Update From Our Team</h2>
            <p>We respond here when your inquiry status changes</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FaStar />
                <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 14 }}>
                  Status: {latestInquiryWithResponse.status || 'pending'}
                </span>
              </div>
              <p style={{ fontStyle: 'italic' }}>
                "{latestInquiryWithResponse.response}"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span>{(user.firstName || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="author-info">
                  <h4>{user.firstName || 'You'} {user.lastName || ''}</h4>
                  <span>Inquiry ID: {latestInquiryWithResponse.inquiry_id}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="section-actions">
            <a href="/inquire" className="btn btn-outline">
              View All Inquiries ({myInquiries.length})
            </a>
          </div>
        </section>
        );
      })()}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-badge">
            <FaLeaf />
            <span>Start Your Journey</span>
          </div>
          <h2>Ready to Begin Your Wellness Journey?</h2>
          <p>Book your stay today and embrace holistic wellness in our authentic Ayurvedic environment.</p>
          <div className="cta-features">
            <div className="cta-feature">
              <FaSwimmingPool />
              <span>Ocean Views</span>
            </div>
            <div className="cta-feature">
              <FaTree />
              <span>Natural Setting</span>
            </div>
            <div className="cta-feature">
              <FaWind />
              <span>Fresh Air</span>
            </div>
          </div>
          <div className="cta-actions">
            <a href="/add_booking" className="btn btn-primary btn-large">
              <FaLeaf />
              Book Your Stay Now
              <FaArrowRight />
            </a>
            <a href="/inquire" className="btn btn-outline btn-large">
              Ask Questions
            </a>
          </div>
        </div>
        <div className="cta-image">
          <img src={package4} alt="Wellness Journey" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;


