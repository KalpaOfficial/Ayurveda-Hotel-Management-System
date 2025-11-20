import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import ImageSlider from "./ImageSlider";
import "./Ayurveda.css";
import { FaLeaf, FaArrowRight,FaSwimmingPool,FaTree,FaWind } from "react-icons/fa";


// images
import heroImage from "../Ayurveda/frontview.jpg";
import package1 from "../Home/garden.jpg";
import package2 from "../Ayurveda/flowerbath.jpg";
import package3 from "../Home/welcomeayu.jpg";
import package4 from "../Home/gardenjuice.jpg";

function Ayurveda() {
  const [expandedPackages, setExpandedPackages] = useState({});

  const togglePackage = (packageId) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };
  const navigate = useNavigate();


  const packageData = [
  {
    id: 1,
    title: "7 Days Rejuvenation",
    description: "A one-week journey to refresh and restore your energy.",
    fullDescription:
      "Our 7-day rejuvenation program is designed for those seeking a short yet deeply transformative Ayurvedic experience. With daily treatments, herbal therapies, yoga, and mindful nutrition, this package helps reduce stress, boost vitality, and leave you feeling refreshed from head to toe.",
    image: package1,
    price: {
      season: "$950",
      offSeason: "$750",
    },
    buttonText: "Book Now",
  },
  {
    id: 2,
    title: "14 Days Wellness",
    description: "Two weeks of holistic therapies for body and mind balance.",
    fullDescription:
      "This 14-day wellness package combines personalized Ayurvedic treatments, yoga sessions, meditation, and dietary guidance to restore balance across all three doshas — Vatha, Pitha, and Kapha. Perfect for guests looking to reset their lifestyle and cultivate sustainable well-being.",
    image: package2,
    price: {
      season: "$1,800",
      offSeason: "$1,450",
    },
    buttonText: "Book Now",
  },
  {
    id: 3,
    title: "21 Days Detox & Healing",
    description: "A complete detoxification and healing experience.",
    fullDescription:
      "Over 21 days, this immersive program gently cleanses the body of toxins while strengthening your inner systems through Panchakarma therapies, herbal medicines, and restorative practices. Ideal for those seeking long-term healing, deep detoxification, and renewed vitality.",
    image: package3,
    price: {
      season: "$2,500",
      offSeason: "$2,100",
    },
    buttonText: "Book Now",
  },
  {
    id: 4,
    title: "Weekend Refresh (3 Days)",
    description: "A quick escape to relax and recharge in nature.",
    fullDescription:
      "Perfect for a short getaway, this 3-day refresh package offers traditional Ayurvedic massages, herbal steam baths, and calming yoga sessions. Designed to melt away fatigue and stress, it’s a weekend retreat that leaves you energized and at peace.",
    image: package4,
    price: {
      season: "$450",
      offSeason: "$350",
    },
    buttonText: "Book Now",
  },
 
  {
    id: 6,
    title: "Senior Wellness (10 Days)",
    description: "Gentle therapies designed for healthy aging and vitality.",
    fullDescription:
      "Tailored for seniors, this 10-day program focuses on joint care, improved mobility, memory enhancement, and relaxation. Using time-tested Ayurvedic therapies and Rasayana rejuvenation techniques, it helps maintain strength, energy, and peace of mind during graceful aging.",
    image: package2,
    price: {
      season: "$1,600",
      offSeason: "$1,250",
    },
    buttonText: "Book Now",
  },
];


  
  return (
    
    <div className="ayurveda-page">
      <Nav />
      
      {/* Image Slider */}
      <ImageSlider />
      
      {/* Hero Section */}

      {/* Hero Section */}


      


      {/* 2. About Ayurveda Section */}
      <section className="about-ayurveda">
  <div className="container">
    <h2>About Ayurveda</h2>
    <p>
      Ayurveda, the “Science of Life,” is one of the world’s oldest holistic healing systems, 
      rooted in ancient India over 5000 years ago. More than just a form of medicine, Ayurveda 
      is a way of living that nurtures the deep connection between mind, body, and spirit. 
      Through a unique blend of natural therapies, herbal remedies, mindful practices, and 
      dietary wisdom, Ayurveda empowers you to discover balance, vitality, and inner peace.
    </p>

    <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
      Ayurveda is built upon the balance of the three doshas: <br />
      <strong>Vatha · Pitha · Kapha</strong>
    </p>

    <p>
      Unlike quick fixes, Ayurveda is personalized — designed around your unique body constitution 
      (doshas) and lifestyle. Its timeless practices promote detoxification, rejuvenation, 
      stress release, and long-term wellness, guiding you back to your true natural rhythm.
    </p>

    <h2>Sath Villa Naadi Ayurveda Resort</h2>
    <p>
      Nestled along the serene coastline of Sri Lanka, <strong>Sath Villa Naadi Ayurveda Resort</strong> 
      is more than just a retreat — it’s a sanctuary where ancient healing meets the calming energy 
      of the ocean. Our resort embodies the true spirit of Ayurveda, offering carefully tailored 
      treatments, therapeutic oil massages, herbal steam baths, yoga, and meditation sessions 
      designed to restore harmony to your entire being.
    </p>
    <p>
      Surrounded by lush greenery and the soothing sounds of waves, every corner of Sath Villa 
      invites you to slow down, breathe deeply, and reconnect with yourself. Here, our expert 
      Ayurvedic doctors and therapists craft personalized wellness journeys — whether your goal 
      is to detoxify, rejuvenate, or simply find tranquility away from the stresses of daily life.
    </p>
    <p>
      With authentic Ayurvedic cuisine, peaceful garden spaces, and the warmth of Sri Lankan 
      hospitality, Sath Villa Naadi Ayurveda Resort is not just a destination — it’s a transformative 
      experience that stays with you long after your stay.
    </p>
  </div>
</section>



      {/* Exclusive Benefits Section */}
      <section className="exclusive-benefits">
        <div className="container">
          <h2>Exclusive Healing Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">⚕️</div>
              <h3>Personalized Ayurvedic Programs</h3>
              <p>Tailored treatments designed specifically for your unique constitution and health needs.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">👨‍⚕️</div>
              <h3>Expert Ayurvedic Doctors</h3>
              <p>Highly qualified practitioners with years of experience in traditional Ayurvedic medicine.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🍃</div>
              <h3>Authentic, Healthy Ayurveda Cuisine</h3>
              <p>Nourishing meals prepared according to Ayurvedic principles to support your healing journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Direct Section */}
      <section className="why-book-direct">
        <div className="container">
          <h2>Why Book Direct?</h2>
          <p>Through personalized consultations, diagnostic assessments, and therapeutic interventions, we identify imbalances and tailor a comprehensive regimen of Ayurvedic treatments, dietary recommendations, herbal supplements, yoga practices and meditation techniques to restore equilibrium and vitality.</p>
          <p>Our Swastha packages extend beyond mere physical healing, nurturing your soul, senses, and mind, fostering a profound sense of well-being that permeates every aspect of your being. Whether you seek prevention, cure, or overall wellness, our Swastha packages offer a transformative journey towards health, happiness, and harmony.</p>
        </div>
      </section>

      {/* Ayurveda Packages Section */}
      <section className="ayurveda-packages">
        <div className="container">
          <h2>Ayurveda Treatment Packages</h2>
          <p className="section-intro">Discover tailored Ayurvedic programs that restore balance, improve immunity and rejuvenate your body, mind and soul.</p>
          <div className="packages-grid">
  {packageData.map(pkg => (
    <div key={pkg.id} className="package-card">
      <div className="package-image-container">
        <img src={pkg.image} alt={pkg.title} className="package-image" />
      </div>
      <div className="package-content">
        <h3>{pkg.title}</h3>
        <p className="package-description">{pkg.description}</p>
        <p>{pkg.fullDescription}</p>

        <div className="package-prices">
          <p><span>Season Price:</span> {pkg.price.season}</p>
          <p><span>Off-Season Price:</span> {pkg.price.offSeason}</p>
        </div>

        <button 
  className="book-btn" 
  onClick={() => navigate("/add_booking")}
>
  {pkg.buttonText}
</button>

      </div>
    </div>
  ))}
</div>
          
        </div>
      </section>

       {/* 6. Treatments & Services Section */}
      <section className="ayurveda-treatments">
        <div className="container">
          <h2>Our Treatments & Services</h2>
          <p>We offer a wide range of traditional Ayurvedic therapies to detoxify, rejuvenate, and restore your mind and body.</p>
          <ul>
            <li>Abhyanga - Full-body massage with herbal oils</li>
            <li>Shirodhara - Flow of herbal oil on the forehead</li>
            <li>Panchakarma - Complete detoxification therapies</li>
            <li>Ayurvedic Facials & Skin Treatments</li>
            <li>Meditation & Yoga Sessions</li>
          </ul>
        </div>
      </section>

      {/* Complimentary Experiences Section */}
      <section className="complimentary-experiences">
        <div className="container">
          <h2>Complimentary Experiences</h2>
          
          <div className="experience-tier">
            <div className="tier-header">
              <span className="tier-icon">🌿</span>
              <h3>Complimentary experiences and excursions for stays of 7 nights or more</h3>
            </div>
            
            <div className="on-property">
              <h4>On the property once during the stay:</h4>
              <ul>
                <li>
                  <strong>THE DETOX WALK:</strong> Enjoy a guided nature walk through our serene property, 
                  teeming with butterflies, birds, and wildlife, featuring natural meditation 
                  spots and tranquil lakes, fostering a deep connection with nature.
                </li>
                <li>
                  <strong>CRYSTAL SINGING BOWLS:</strong> Experience wellness through music therapy and 
                  mindfulness with the soothing vibrations of crystal singing bowls to 
                  harmonise with mind and body.
                </li>
                <li>
                  <strong>POTTERY BLISS:</strong> Calm your mind with hands-on pottery sessions led by a 
                  skilled master in our on-site studio, immersing yourself in a rich cultural 
                  experience.
                </li>
                <li>
                  <strong>HERBAL HIGH TEA DELIGHTS:</strong> Enjoy treats made from wholesome ingredients 
                  like rice flour, pumpkin, garlic and sesame, along with traditional 
                  sweetmeats crafted from locally sourced natural ingredients.
                </li>
              </ul>
            </div>
            
            <div className="excursions">
              <h4>Excursions:</h4>
              <ul>
                <li>
                  <strong>SPIRITUAL EXCURSIONS:</strong> Explore exclusive offerings like guided meditation at 
                  Kaludiya Pokuna, a hidden archaeological marvel within nature's embrace 
                  Immerse yourself in ancient rituals of Pirith chanting and Shanthikarma 
                  blessings, connecting to centuries-old traditions of healing.
                </li>
                <li>
                  <strong>ECHOES OF HISTORY:</strong> Explore the majestic Sigiriya Rock, celebrated as the 8th 
                  wonder of the world. Discover the Dambulla Cave Temple, a sacred 
                  pilgrimage site for over 22 centuries, both providing glimpses into Sri 
                  Lanka's captivating past of art and culture.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="experience-tier">
            <div className="tier-header">
              <span className="tier-icon">🌞</span>
              <h3>Complimentary experiences and excursions for stays of 14 nights or more</h3>
            </div>
           <ul className="tier-list">
    <li>🌿 Guided village walk with local herbal garden visit</li>
    <li>🧘‍♂️ Sunrise yoga & meditation by the river (once per stay)</li>
    <li>🍵 Ayurvedic cooking class with our chef</li>
    <li>🌊 Evening beach meditation with herbal tea</li>
  </ul>
          </div>
          
          <div className="experience-tier">
            <div className="tier-header">
              <span className="tier-icon">🌅</span>
              <h3>Complimentary experiences and excursions for stays of 21 nights or more</h3>
            </div>
            <ul className="tier-list">
    <li>🚤 Half-day boat safari or lagoon excursion</li>
    <li>🏞️ Guided nature trek with Ayurvedic picnic lunch</li>
    <li>🪔 Traditional cultural performance evening</li>
    <li>🧘 Personalized yoga therapy session (60 minutes)</li>
    <li>🍯 Take-home Ayurvedic wellness kit</li>
  </ul>
          </div>
        </div>
      </section>

       {/* 8. Testimonials Section */}
      <section className="ayurveda-testimonials">
        <div className="container">
          <h2>What Our Guests Say</h2>
          <p>"The Ayurvedic treatments were life-changing. I feel rejuvenated and balanced." – <strong>Jane D.</strong></p>
          <p>"Expert care, serene environment, and delicious healthy meals. Highly recommended!" – <strong>Raj P.</strong></p>
          <p>"A holistic experience that truly nourished my mind, body, and soul." – <strong>Amara S.</strong></p>
        </div>
      </section>

      {/* 9. Booking / Call-to-Action Section */}
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
          <img src={package2} alt="Wellness Journey" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Ayurveda;