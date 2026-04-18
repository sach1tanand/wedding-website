import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import React, { useEffect, useState } from 'react';
import * as api from './api';
import './styles/global.css';
import { deletePhoto } from './api';

const WEDDING_DATE = '2026-04-29T18:00:00+05:30';
const EVENTS = [
  { id: 1, name: 'Sangeet Ceremony', icon: 'S', date: '2026-04-27', time: '9:00 AM', venue: 'Sarmastpur, Muzaffarpur', dress: 'Festive traditional' },
  { id: 2, name: 'Haldi Ceremony', icon: 'H', date: '2026-04-28', time: 'Morning', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Yellow or light festive wear' },
  { id: 3, name: 'Satyanarayan Puja', icon: 'P', date: '2026-04-28', time: 'Daytime', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Traditional attire' },
  { id: 4, name: 'Gidhari / Matkor', icon: 'M', date: '2026-04-28', time: 'Evening', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Traditional attire' },
  { id: 5, name: 'Wedding Ceremony', icon: 'W', date: '2026-04-29', time: '6:00 PM', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Wedding attire' },
];

const fmt = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

function Notification({ msg, onClose }) {
  useEffect(() => {
    if (!msg) return undefined;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [msg, onClose]);
  return msg ? <div className="notif">{msg}</div> : null;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [['#story', 'About'], ['#schedule', 'Events'], ['#location', 'Venue'], ['#media', 'Gallery'], ['#rsvp', 'RSVP'], ['#guestbook', 'Blessings']];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">D &amp; A</div>
        <ul className="nav-links">
          {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
        </ul>
        <button className="hamburger btn-icon" style={{ border: 'none', background: 'none', width: 'auto', height: 'auto' }} onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-nav ${open ? 'open' : ''}`}>
        {links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </div>
    </>
  );
}

function Hero() {
  const [cd, setCd] = useState({ d: '--', h: '--', m: '--', s: '--' });

  useEffect(() => {
    const target = new Date(WEDDING_DATE);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCd({ d: '00', h: '00', m: '00', s: '00' });
        return;
      }
      setCd({
        d: String(Math.floor(diff / 86400000)),
        h: fmt(Math.floor((diff % 86400000) / 3600000)),
        m: fmt(Math.floor((diff % 3600000) / 60000)),
        s: fmt(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <span className="eyebrow">You are warmly invited to celebrate</span>
        <h1 className="hero-names"><em>Deepak</em></h1>
        <span className="hero-amp">&amp; Awantika</span>
        <p className="hero-date">Wednesday | April 29, 2026 | 6:00 PM | Pirnagar, Begusarai, Bihar</p>
        <div className="hero-divider" />
        <p className="hero-tagline">Sangeet on April 27, rituals on April 28, wedding on April 29</p>
        <div className="countdown">
          {[['Days', cd.d], ['Hours', cd.h], ['Mins', cd.m], ['Secs', cd.s]].map(([label, value], index) => (
            <React.Fragment key={label}>
              {index > 0 && <span className="cd-sep">|</span>}
              <div className="cd-box"><span className="cd-num">{value}</span><span className="cd-label">{label}</span></div>
            </React.Fragment>
          ))}
        </div>
        <a href="#rsvp" className="btn-primary">Save the Date and RSVP</a>
      </div>
    </section>
  );
}

function Story() {
  const items = [
    { year: '27 Apr 2026', title: 'Sangeet Ceremony', text: 'Sangeet ceremony at 9:00 AM in Sarmastpur, Muzaffarpur.', icon: 'S' },
    { year: '28 Apr 2026', title: 'Haldi and Rituals', text: 'Haldi, Satyanarayan Puja, and Gidhari or Matkor in Pirnagar, Begusarai.', icon: 'H' },
    { year: '29 Apr 2026', title: 'Wedding Evening', text: 'Wedding ceremony at 6:00 PM in Pirnagar, Begusarai, Bihar.', icon: 'W' },
  ];

  return (
    <section id="story" className="section bg-white">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Wedding Details</span>
          <h2 className="section-title">Celebration <em>Journey</em></h2>
          <div className="section-rule" />
        </div>
        <div className="story-timeline">
          {items.map((item, index) => (
            <div key={item.title} className={`story-item ${index % 2 === 1 ? 'rev' : ''}`}>
              <div className="s-text"><span className="s-year">{item.year}</span><h3 className="s-name">{item.title}</h3><p>{item.text}</p></div>
              <div className="s-dot-wrap"><div className="s-dot" /></div>
              <div className="s-img"><div className="s-img-box">{item.icon}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Schedule() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.getEvents().then((response) => setEvents(response.data.events)).catch(() => {
      const today = new Date().toISOString().split('T')[0];
      setEvents(EVENTS.map((event) => ({ ...event, isToday: event.date === today })));
    });
  }, []);

  return (
    <section id="schedule" className="section">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Celebration Events</span>
          <h2 className="section-title">Wedding <em>Schedule</em></h2>
          <div className="section-rule" />
          <p className="section-sub">Main wedding on April 29, 2026 at 6:00 PM</p>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className={`event-card ${event.isToday ? 'today' : ''}`}>
              <span className={`ev-badge ${event.isToday ? 'today-b' : ''}`}>{event.isToday ? 'Today' : fmtDate(event.date)}</span>
              <span className="ev-icon">{event.icon}</span>
              <div className="ev-name">{event.name}</div>
              <div className="ev-meta"><span>Time: {event.time}</span><span>Venue: {event.venue}</span></div>
              <div className="ev-dress">{event.dress}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="location" className="section bg-white">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Where to join us</span>
          <h2 className="section-title">Event <em>Venues</em></h2>
          <div className="section-rule" />
        </div>
        <div className="venues-grid">
          <div className="venue-card">
            <div className="venue-img">S</div>
            <div className="venue-info">
              <div className="venue-name">Sarmastpur, Muzaffarpur</div>
              <div className="venue-addr">Sangeet ceremony on April 27, 2026 at 9:00 AM</div>
              <div className="venue-ev">Opening celebration with music and family gathering</div>
              <a href="https://www.google.com/maps/search/Sarmastpur+Muzaffarpur" target="_blank" rel="noreferrer" className="btn-outline">Directions</a>
            </div>
          </div>
          <div className="venue-card">
            <div className="venue-img">P</div>
            <div className="venue-info">
              <div className="venue-name">Pirnagar, Begusarai, Bihar</div>
              <div className="venue-addr">Haldi, Satyanarayan Puja, Gidhari or Matkor, and the wedding ceremony</div>
              <div className="venue-ev">April 28 to April 29, 2026</div>
              <a href="https://www.google.com/maps/search/Pirnagar+Begusarai+Bihar" target="_blank" rel="noreferrer" className="btn-outline">Directions</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Media({ notify }) {
  const [tab, setTab] = useState('photos');
  const [category, setCategory] = useState('all');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [videoForm, setVideoForm] = useState({ driveUrl: '', title: '', uploadedBy: '', category: 'all' });
  const categories = ['all', 'sangeet', 'haldi', 'puja', 'matkor', 'wedding'];
  const [visible, setVisible] = useState(false);

  const loadPhotos = () => api.getGallery(category).then((res) => setPhotos(res.data.photos || [])).catch(() => setPhotos([]));
  const loadVideos = () => api.getVideos(category).then((res) => setVideos(res.data.videos || [])).catch(() => setVideos([]));

  useEffect(() => {
    if (tab === 'photos') loadPhotos();
    else loadVideos();
  }, [tab, category]);

  const uploadPhotos = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;

    const form = new FormData();
    files.forEach((file) => form.append('photos', file));
    form.append('category', category);

    setUploading(true);
    try {
      await api.uploadPhotos(form);
      notify(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded.`);
      loadPhotos();
    } catch (error) {
      notify(error.response?.data?.error || 'Photo upload failed.');
    }
    setUploading(false);
    event.target.value = '';
  };

  const submitVideo = async () => {
    if (!videoForm.driveUrl.trim()) {
      notify('Please paste a video link.');
      return;
    }

    try {
      await api.submitVideo(videoForm);
      notify('Video link submitted.');
      setVideoForm({ driveUrl: '', title: '', uploadedBy: '', category: 'all' });
      loadVideos();
    } catch (error) {
      notify(error.response?.data?.error || 'Video submit failed.');
    }
  };
const handleDelete = async (id) => {
  if (!window.confirm("Delete this photo?")) return;

  try {
    await deletePhoto(id);
    setPhotos(prev => prev.filter(p => p._id !== id));
    notify("Photo deleted");
  } catch (err) {
    console.error(err);
    notify("Delete failed");
  }
};
 
 useEffect(() => {
  const handleHashChange = () => {
    setVisible(false);
  };

  window.addEventListener("hashchange", handleHashChange);

  return () => {
    window.removeEventListener("hashchange", handleHashChange);
  };
}, []);

  return (
    <section id="media" className="section">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Photos and Videos</span>
          <h2 className="section-title">Share <em>Memories</em></h2>
          <div className="section-rule" />
          <p className="section-sub">Upload photos directly, or paste a Google Drive / video link.</p>
        </div>

        <div className="gallery-tabs">
          <button className={`gtab ${tab === 'photos' ? 'active' : ''}`} onClick={() => setTab('photos')}>Photos</button>
          <button className={`gtab ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>Videos</button>
        </div>

        <div className="gallery-filters">
          {categories.map((item) => (
            <button key={item} className={`filter-btn ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'photos' && (
  <>
    <div className="upload-zone">
      <span className="upload-icon">UP</span>
      <h3>{uploading ? 'Uploading...' : 'Upload Photos'}</h3>
      <p>Choose photos from your phone or computer. They will show below instantly.</p>
      <input type="file" accept="image/*" multiple onChange={uploadPhotos} disabled={uploading} />
    </div>

    {photos.length === 0 ? (
      <div className="empty-state">
        <p>No photos yet. Be the first to upload.</p>
      </div>
    ) : (
      

	<PhotoProvider
  	 visible={visible}
  	 onVisibleChange={setVisible}
	>
        <div className="gallery-masonry">
          {photos.map((photo) => (
            <PhotoView key={photo._id} src={photo.url}>
              <div className="g-item relative">
  <img
    src={photo.thumbUrl || photo.url}
    alt="wedding"
    className="cursor-pointer"
  />

  <span className="g-tag">{photo.category}</span>

  {/* Download Button */}
  <button
  onClick={async () => {
    const response = await fetch(photo.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = photo._id + ".jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }}
  className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 text-xs rounded"
>
  ⬇ Download
</button>
{sessionStorage.getItem("adminToken") && (
  <button
    onClick={() => handleDelete(photo._id)}
    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded"
  >
    🗑
  </button>
)}
</div>
            </PhotoView>
          ))}
        </div>
      </PhotoProvider>
    )}
  </>
)}

        {tab === 'videos' && (
          <>
            <div className="video-form">
              <h3>Submit a Video Link</h3>
              <div className="form-row">
                <div className="form-group"><label>Your Name</label><input className="form-control" value={videoForm.uploadedBy} onChange={(e) => setVideoForm((f) => ({ ...f, uploadedBy: e.target.value }))} placeholder="Guest name" /></div>
                <div className="form-group"><label>Category</label><select className="form-control" value={videoForm.category} onChange={(e) => setVideoForm((f) => ({ ...f, category: e.target.value }))}>{categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'General' : item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Video Title</label><input className="form-control" value={videoForm.title} onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sangeet dance" /></div>
              <div className="form-group"><label>Video Link</label><input className="form-control" value={videoForm.driveUrl} onChange={(e) => setVideoForm((f) => ({ ...f, driveUrl: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
              <button className="btn-primary w-full" onClick={submitVideo}>Submit Video</button>
            </div>

            {videos.length === 0 ? (
              <div className="empty-state"><p>No videos yet. Paste the first link above.</p></div>
            ) : (
              <div className="videos-grid">
                {videos.map((video) => (
                  <div key={video._id} className="video-card">
                    <iframe className="video-embed" src={video.embedUrl} title={video.title} allowFullScreen />
                    <div className="video-info">
                      <div className="video-title">{video.title}</div>
                      <div className="video-meta"><span>{video.category} | {video.uploadedBy}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function RSVP({ notify }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', guests: 'Just me (1)', events: 'Wedding Ceremony', meal: 'veg', message: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      notify('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await api.submitRSVP(form);
      setDone(true);
      notify('RSVP confirmed. We look forward to celebrating with you.');
    } catch (error) {
      notify(error.response?.data?.errors?.[0]?.msg || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section id="rsvp" className="section bg-blush">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Join the Celebration</span>
          <h2 className="section-title">RSVP <em>Now</em></h2>
          <div className="section-rule" />
        </div>
        <div className="rsvp-card">
          {done ? (
            <div className="rsvp-success">
              <div className="check">OK</div>
              <h3>You are on the guest list</h3>
              <p>Thank you for confirming. See you in Bihar for Deepak and Awantika&apos;s wedding.</p>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group"><label>Your Name *</label><input name="name" className="form-control" placeholder="Full name" value={form.name} onChange={change} /></div>
                <div className="form-group"><label>Phone</label><input name="phone" className="form-control" placeholder="+91 00000 00000" value={form.phone} onChange={change} /></div>
              </div>
              <div className="form-group"><label>Email</label><input name="email" type="email" className="form-control" placeholder="your@email.com" value={form.email} onChange={change} /></div>
              <div className="form-row">
                <div className="form-group"><label>Number of Guests</label><select name="guests" className="form-control" value={form.guests} onChange={change}>{['Just me (1)', '2 guests', '3 guests', '4 guests', '5+ guests'].map((option) => <option key={option}>{option}</option>)}</select></div>
                <div className="form-group"><label>Attending Events</label><select name="events" className="form-control" value={form.events} onChange={change}>{['Wedding Ceremony', 'Sangeet Ceremony', 'Haldi and Rituals', 'All Events'].map((option) => <option key={option}>{option}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Meal Preference</label><div className="radio-group">{[['veg', 'Vegetarian'], ['nonveg', 'Non-Vegetarian'], ['vegan', 'Vegan'], ['jain', 'Jain']].map(([value, label]) => <label key={value} className="radio-opt"><input type="radio" name="meal" value={value} checked={form.meal === value} onChange={change} />{label}</label>)}</div></div>
              <div className="form-group"><label>Message for the Couple</label><textarea name="message" className="form-control" rows="3" placeholder="Share your blessings" value={form.message} onChange={change} /></div>
              <button className="btn-primary w-full" onClick={submit} disabled={loading}>{loading ? 'Submitting' : 'Confirm Attendance'}</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Guestbook({ notify }) {
  const [wishes, setWishes] = useState([]);
  const [form, setForm] = useState({ name: '', message: '' });
  const [loading, setLoading] = useState(false);
  const defaults = [
    { _id: 'd1', name: 'Family Blessings', message: 'Wishing Deepak and Awantika a joyful married life filled with love and togetherness.', createdAt: new Date() },
    { _id: 'd2', name: 'Best Wishes', message: 'May your new journey begin with happiness, peace, and many beautiful memories.', createdAt: new Date() },
  ];

  const load = () => api.getWishes().then((response) => setWishes(response.data.wishes || [])).catch(() => setWishes(defaults));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      notify('Please fill in your name and blessing.');
      return;
    }
    setLoading(true);
    try {
      await api.submitWish(form);
      setForm({ name: '', message: '' });
      load();
      notify('Blessing added.');
    } catch (error) {
      notify('Could not submit the blessing.');
    }
    setLoading(false);
  };

  return (
    <section id="guestbook" className="section bg-white">
      <div className="wrap">
        <div className="section-hd">
          <span className="eyebrow">Leave a Blessing</span>
          <h2 className="section-title">Guest <em>Messages</em></h2>
          <div className="section-rule" />
        </div>
        <div className="wishes-grid">
          {wishes.map((wish) => <div key={wish._id} className="wish-card"><div className="wish-name">{wish.name}</div><div className="wish-msg">{wish.message}</div><div className="wish-date">{fmtDate(wish.createdAt)}</div></div>)}
        </div>
        <div className="wish-form">
          <h3>Send Your Blessings</h3>
          <div className="form-group"><label>Your Name</label><input className="form-control" placeholder="Your name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} /></div>
          <div className="form-group"><label>Your Blessing</label><textarea className="form-control" rows="3" placeholder="Write your blessing for the couple" value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} /></div>
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>{loading ? 'Sending' : 'Send Blessings'}</button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-names">Deepak &amp; Awantika</div>
      <p>April 29, 2026 | 6:00 PM | Pirnagar, Begusarai, Bihar</p>
      <div className="footer-rule" />
      <p className="footer-sub">With the blessings of family, we look forward to celebrating with you.</p>
    </footer>
  );
}

export default function App() {
  const [notif, setNotif] = useState('');
  return (
    <div className="app">
<div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
  {!sessionStorage.getItem("adminToken") ? (
    <button
      onClick={() => {
        const pw = prompt("Enter admin password");
        if (!pw) return;

        api.adminLogin(pw)
          .then(res => {
            sessionStorage.setItem("adminToken", res.data.token);
            alert("Admin logged in ✅");
            window.location.reload();
          })
          .catch(() => alert("Wrong password ❌"));
      }}
    >
      Admin Login
    </button>
  ) : (
    <button
      onClick={() => {
        sessionStorage.removeItem("adminToken");
        alert("Logged out");
        window.location.reload();
      }}
    >
      Logout
    </button>
  )}
</div>
      <Notification msg={notif} onClose={() => setNotif('')} />
      <Navbar />
      <Hero />
      <Story />
      <Schedule />
      <Location />
      <Media notify={setNotif} />
      <RSVP notify={setNotif} />
      <Guestbook notify={setNotif} />
      <Footer />
    </div>
  );
}
