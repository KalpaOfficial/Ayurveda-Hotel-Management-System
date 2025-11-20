import React, { useRef, useEffect, useState } from "react";   // ✅ add useRef here
import emailjs from "emailjs-com";       // ✅ import emailjs
import "./AboutUs.css";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";


const stats = [
  { label: "Years of Heritage", value: "45+" },
  { label: "Authentic Treatments", value: "120+" },
  { label: "Certified Therapists", value: "30+" },
  { label: "Guest Satisfaction", value: "4.9/5" },
];

const team = [
  { name: "Dr. K. Perera", role: "Chief Ayurvedic Physician", img: require("../Home/welcomeayu.jpg") },
  { name: "Nimali Fernando", role: "Wellness Manager", img: require("../Home/flowerbath.jpg") },
  { name: "Saman Silva", role: "Lead Guide", img: require("../Home/garden.jpg") },
];

export default function AboutUs() {
  const form = useRef();
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    subject: "",
    message: ""
  });

  // Handle URL parameters and pre-fill form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestType = urlParams.get('request');
    const bookingId = urlParams.get('bookingId');
    
    if (requestType === 'update') {
      setFormData(prev => ({
        ...prev,
        subject: `Booking Update Request - ID: ${bookingId || 'N/A'}`,
        message: `I would like to request an update to my booking.\n\nBooking ID: ${bookingId || 'N/A'}\n\nPlease provide details about the changes needed.`
      }));
    } else if (requestType === 'cancellation') {
      setFormData(prev => ({
        ...prev,
        subject: `Booking Cancellation Request - ID: ${bookingId || 'N/A'}`,
        message: `I would like to request a cancellation for my booking.\n\nBooking ID: ${bookingId || 'N/A'}\n\nPlease provide information about the cancellation process and any applicable refunds.`
      }));
    }

    // Auto-fill user data if available
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        user_name: `${user.firstName} ${user.lastName}`,
        user_email: user.email,
        user_phone: user.phone || ""
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_fd44s6r",   // Replace with EmailJS Service ID
        "template_rszon8i",  // Replace with EmailJS Template ID
        form.current,
        "spDpS1wHz1PUBMMTC"       // Replace with EmailJS Public Key
      )
      .then(
        (result) => {
          alert("✅ Your message has been sent successfully!");
          form.current.reset();
        },
        (error) => {
          alert("❌ Something went wrong, please try again.");
          console.error(error);
        }
      );
  };

  return (
    <div className="aboutus">
      <Nav/>
      {/* HERO */}
      <header className="hero">
        <div className="hero-grid">
          <div className="hero-text">
            <span className="hero-badge">Sath Villa • Naadi Ayurveda Resort</span>
            <h1 className="hero-title">
              Where Traditional Ayurveda Meets Sri Lanka’s Cultural Heart
            </h1>
            <p className="hero-desc">
              We blend centuries-old Ayurvedic wisdom with guided cultural experiences —
              from personalized Panchakarma therapies to curated tours of Sigiriya, Galle
              Fort and Anuradhapura. Experience healing, rest and cultural immersion in
              one trusted service.
            </p>

            <div className="hero-buttons">
         
              <a href="#learn" className="btn-outline">
                Learn Our Approach
              </a>
            </div>

            <div className="hero-subtext">
              Multilingual support • Secure payments • Verified guides & therapists
            </div>
          </div>

          <div className="hero-image-wrap">
            <div className="hero-image">
              <img
                src={require("../Home/frontview.jpg")}
                alt="Sath Villa Naadi Ayurveda Resort"
              />
            </div>
            <div className="hero-card">
              <div className="hero-card-label">Featured Experience</div>
              <div className="hero-card-title">Traditional Panchakarma</div>
              <div className="hero-card-desc">Authentic detoxification treatments</div>
            </div>
          </div>
        </div>
      </header>

      {/* MISSION & VALUES */}
      <section id="learn" className="mission">
        <div className="mission-grid">
          <div className="mission-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-desc">
              To make authentic Ayurvedic care and Sri Lanka’s cultural heritage accessible
              in a single, trusted platform. We empower local villas and guides to reach
              global travelers while ensuring safety, transparency, and personalized care
              for each guest.
            </p>

            <div className="values-grid">
              <div className="value-card">
                <h3>Authenticity</h3>
                <p>
                  Treatments handcrafted by certified physicians using locally-sourced
                  herbs.
                </p>
              </div>
              <div className="value-card">
                <h3>Integration</h3>
                <p>
                  Seamless booking of wellness packages and cultural tours in one flow.
                </p>
              </div>
              <div className="value-card">
                <h3>Transparency</h3>
                <p>Clear pricing, verified reviews, and secure online payments.</p>
              </div>
              <div className="value-card">
                <h3>Sustainability</h3>
                <p>Supporting local communities and promoting responsible tourism.</p>
              </div>
            </div>
          </div>

          <aside className="mission-facts">
            <h4>Quick Facts</h4>
            <ul>
              <li>Certified Ayurveda physicians and therapists</li>
              <li>Flexible packages: day treatments to multi-week therapies</li>
              <li>Integrated transport & guide booking</li>
              <li>Secure international payments</li>
            </ul>
            <a href="#contact" className="facts-link">
              Contact our Partnership Team →
            </a>
          </aside>
        </div>
      </section>

      {/* IMAGE GALLERY */}
      <section className="gallery">
        <div className="gallery-container">
          <h3 className="section-title">Our Beautiful Resort</h3>
          <p className="gallery-desc">
            Experience the serene beauty of our resort, where nature meets healing.
          </p>
          <div className="gallery-grid">
            <div className="gallery-item large">
              <img src={require("../Home/garden.jpg")} alt="Lush Garden" />
              <div className="gallery-overlay">
                <h4>Serene Gardens</h4>
                <p>Peaceful natural surroundings</p>
              </div>
            </div>
            <div className="gallery-item">
              <img src={require("../Home/flowerbath.jpg")} alt="Flower Bath Treatment" />
              <div className="gallery-overlay">
                <h4>Flower Bath</h4>
                <p>Traditional healing ritual</p>
              </div>
            </div>
            <div className="gallery-item">
              <img src={require("../Home/gardenjuice.jpg")} alt="Fresh Garden Juice" />
              <div className="gallery-overlay">
                <h4>Fresh Juices</h4>
                <p>Organic garden produce</p>
              </div>
            </div>
            <div className="gallery-item">
              <img src={require("../Home/welcomeayu.jpg")} alt="Welcome Ayurveda" />
              <div className="gallery-overlay">
                <h4>Welcome</h4>
                <p>Begin your healing journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="team">
        <div className="team-container">
          <h3 className="section-title">Meet Our Team</h3>
          <p className="team-desc">
            A small team of certified professionals combining Ayurveda, hospitality and
            local cultural expertise.
          </p>

          <div className="team-grid">
            {team.map((m) => (
              <div key={m.name} className="team-card">
                <img src={m.img} alt={m.name} className="team-img" />
                <div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS & CTA */}
      <section id="book" className="reviews">
        <div className="reviews-content">
          <h4 className="section-title">What Guests Love</h4>
          <p className="review-quote">
            "Transformative treatments and breathtaking cultural walks — a restorative
            experience I’ll never forget." — Maya, USA
          </p>

          <div className="reviews-buttons">
            <a href="/Ayurveda" className="btn-secondary">
              Explore Packages
            </a>
            <a href="#contact" className="btn-outline">
              Talk to a Wellness Specialist
            </a>
          </div>
        </div>
      </section>

       {/* CONTACT FORM */}
      <section id="contact" className="contact">
        <div className="contact-container">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-desc">
            Have questions about our Ayurveda treatments or cultural tours?  
            Fill out the form and we’ll get back to you quickly.
          </p>

          <form ref={form} onSubmit={sendEmail} className="contact-form">
  <input 
    type="text" 
    name="user_name" 
    placeholder="Your Name" 
    value={formData.user_name}
    onChange={handleInputChange}
    required 
  />
  <input 
    type="email" 
    name="user_email" 
    placeholder="Your Email" 
    value={formData.user_email}
    onChange={handleInputChange}
    required 
  />
  <input 
    type="text" 
    name="user_phone" 
    placeholder="Phone Number" 
    value={formData.user_phone}
    onChange={handleInputChange}
  />
  <input 
    type="text" 
    name="subject" 
    placeholder="Subject" 
    value={formData.subject}
    onChange={handleInputChange}
    required 
  />
  <textarea 
    name="message" 
    placeholder="Your Message" 
    value={formData.message}
    onChange={handleInputChange}
    required
  ></textarea>
  <button type="submit" className="btn-primary">Send Message</button>
</form>

        </div>
      </section>

 <Footer/>     
    </div>
    
  );
}