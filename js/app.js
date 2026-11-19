/**
 * AnchorDrop — Core Frontend Application Logic
 * Pure Vanilla JavaScript (Beginner-friendly & readable for viva/class presentations)
 * Handles LocalStorage database, demo authentication, CRUD operations,
 * and the Vessel-to-Berth Compatibility Engine.
 */

// ============================================================================
// 1. DEFAULT DEMO DATA SEEDING
// ============================================================================
const DEFAULT_DOCKS = [
  {
    id: "dock-1",
    name: "Harbor Point Slip A4",
    location: "Miami, Biscayne Bay",
    waterway: "Biscayne Bay Intracoastal",
    dockType: "Floating Dock",
    maxLength: 45,
    maxBeam: 15,
    minDepth: 7,
    dailyPrice: 95,
    amenities: ["Shore Power (30A/50A)", "Fresh Water", "High-speed WiFi", "24/7 Gated Security"],
    image: "images/dock-miami.jpg",
    hostName: "Marina Bay Harbor",
    hostEmail: "robert@marina.com",
    instructions: "Proceed past marker #14 to Slip A4. Marina gate PIN: 4492. Hail Harbormaster on VHF Ch 16."
  },
  {
    id: "dock-2",
    name: "Sunset Marina Deepwater Berth 12",
    location: "Fort Lauderdale, New River",
    waterway: "New River Channel",
    dockType: "Marina Slip",
    maxLength: 65,
    maxBeam: 18,
    minDepth: 10,
    dailyPrice: 140,
    amenities: ["Shore Power (50A/100A)", "Fuel Dock", "Pump Out Station", "Clubhouse & Showers"],
    image: "images/dock-luxury.jpg",
    hostName: "Marina Bay Harbor",
    hostEmail: "robert@marina.com",
    instructions: "Dock at main fuel pier for check-in. Keycard issued at front office. VHF Ch 68."
  },
  {
    id: "dock-3",
    name: "Coconut Grove Private Waterfront Dock",
    location: "Coconut Grove, FL",
    waterway: "Dinner Key Channel",
    dockType: "Fixed Dock",
    maxLength: 36,
    maxBeam: 12,
    minDepth: 5,
    dailyPrice: 65,
    amenities: ["Fresh Water", "Private Locked Gate", "Quiet Residential Setting"],
    image: "images/dock-wood.jpg",
    hostName: "Captain Robert",
    hostEmail: "robert@marina.com",
    instructions: "Private dock behind white estate. Wooden side gate code: 1984. Tie up stern first."
  },
  {
    id: "dock-4",
    name: "Ocean Reef Prestige Mega-Slip",
    location: "Key Largo, Biscayne Channel",
    waterway: "Biscayne Channel Ocean Access",
    dockType: "Piling Dock",
    maxLength: 80,
    maxBeam: 22,
    minDepth: 12,
    dailyPrice: 220,
    amenities: ["3-Phase Shore Power", "Fresh Water", "Concierge Service", "Ice Machine & Crew Lounge"],
    image: "images/dock-sunset.jpg",
    hostName: "Marina Bay Harbor",
    hostEmail: "robert@marina.com",
    instructions: "Deepwater entry via channel waypoint Alpha. Contact Harbor Master 15 mins prior on VHF 71."
  }
];

const DEFAULT_VESSELS = [
  {
    id: "vessel-1",
    name: "Sea Breeze",
    type: "Motor Yacht",
    length: 38,
    beam: 13,
    draft: 4.5,
    registration: "FL-8821-AZ",
    ownerEmail: "sarah@boater.com"
  },
  {
    id: "vessel-2",
    name: "Ocean Pearl",
    type: "Catamaran",
    length: 52,
    beam: 24,
    draft: 4.2,
    registration: "FL-1094-BC",
    ownerEmail: "sarah@boater.com"
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: "BK-101",
    berthId: "dock-1",
    berthName: "Harbor Point Slip A4",
    boaterEmail: "sarah@boater.com",
    boaterName: "Captain Sarah",
    vesselId: "vessel-1",
    vesselName: "Sea Breeze",
    vesselDims: "38ft L x 13ft B x 4.5ft D",
    startDate: "2026-11-20",
    endDate: "2026-11-22",
    totalPrice: 190,
    status: "Accepted", // 'Pending', 'Accepted', 'Rejected'
    specialRequests: "Requesting shore power cord adapter (50A to 30A).",
    arrivalInstructions: "Slip A4 - Gate PIN: 4492. Hail Harbormaster on VHF Ch 16.",
    delayReport: null
  },
  {
    id: "BK-102",
    berthId: "dock-2",
    berthName: "Sunset Marina Deepwater Berth 12",
    boaterEmail: "sarah@boater.com",
    boaterName: "Captain Sarah",
    vesselId: "vessel-2",
    vesselName: "Ocean Pearl",
    vesselDims: "52ft L x 24ft B x 4.2ft D",
    startDate: "2026-11-25",
    endDate: "2026-11-28",
    totalPrice: 420,
    status: "Pending",
    specialRequests: "Arriving around sunset, please keep berth floodlights on.",
    arrivalInstructions: "Marina Slip 12 - Check-in at main clubhouse.",
    delayReport: null
  }
];

// ============================================================================
// 2. DATABASE HELPER (LOCALSTORAGE WRAPPER)
// ============================================================================
const AnchorDropDB = {
  init() {
    if (!localStorage.getItem("anchordrop_docks")) {
      localStorage.setItem("anchordrop_docks", JSON.stringify(DEFAULT_DOCKS));
    }
    if (!localStorage.getItem("anchordrop_vessels")) {
      localStorage.setItem("anchordrop_vessels", JSON.stringify(DEFAULT_VESSELS));
    }
    if (!localStorage.getItem("anchordrop_bookings")) {
      localStorage.setItem("anchordrop_bookings", JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem("anchordrop_registered_users")) {
      const defaultUsers = [
        { email: "sarah@boater.com", name: "Captain Sarah", role: "boater" },
        { email: "robert@marina.com", name: "Marina Bay Harbor (Robert)", role: "owner" }
      ];
      localStorage.setItem("anchordrop_registered_users", JSON.stringify(defaultUsers));
    }
  },

  resetDemo() {
    localStorage.setItem("anchordrop_docks", JSON.stringify(DEFAULT_DOCKS));
    localStorage.setItem("anchordrop_vessels", JSON.stringify(DEFAULT_VESSELS));
    localStorage.setItem("anchordrop_bookings", JSON.stringify(DEFAULT_BOOKINGS));
    alert("Demo data has been reset to default values!");
    window.location.reload();
  },

  // Docks CRUD
  getDocks() {
    this.init();
    return JSON.parse(localStorage.getItem("anchordrop_docks") || "[]");
  },

  getDockById(id) {
    return this.getDocks().find(d => d.id === id);
  },

  saveDock(dock) {
    const docks = this.getDocks();
    const index = docks.findIndex(d => d.id === dock.id);
    if (index >= 0) {
      docks[index] = dock;
    } else {
      dock.id = "dock-" + Date.now();
      docks.unshift(dock);
    }
    localStorage.setItem("anchordrop_docks", JSON.stringify(docks));
    return dock;
  },

  deleteDock(id) {
    const docks = this.getDocks().filter(d => d.id !== id);
    localStorage.setItem("anchordrop_docks", JSON.stringify(docks));
  },

  // Vessels CRUD
  getVessels() {
    this.init();
    return JSON.parse(localStorage.getItem("anchordrop_vessels") || "[]");
  },

  saveVessel(vessel) {
    const vessels = this.getVessels();
    const index = vessels.findIndex(v => v.id === vessel.id);
    if (index >= 0) {
      vessels[index] = vessel;
    } else {
      vessel.id = "vessel-" + Date.now();
      vessels.unshift(vessel);
    }
    localStorage.setItem("anchordrop_vessels", JSON.stringify(vessels));
    return vessel;
  },

  deleteVessel(id) {
    const vessels = this.getVessels().filter(v => v.id !== id);
    localStorage.setItem("anchordrop_vessels", JSON.stringify(vessels));
  },

  // Bookings CRUD
  getBookings() {
    this.init();
    return JSON.parse(localStorage.getItem("anchordrop_bookings") || "[]");
  },

  createBooking(booking) {
    const bookings = this.getBookings();
    booking.id = "BK-" + Math.floor(100 + Math.random() * 900);
    booking.status = "Pending";
    booking.delayReport = null;
    bookings.unshift(booking);
    localStorage.setItem("anchordrop_bookings", JSON.stringify(bookings));
    return booking;
  },

  updateBookingStatus(id, newStatus) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.id === id);
    if (b) {
      // If accepting, verify overlapping accepted bookings for this berth.
      // Same-day turnover (e.g. check-out 11:00 AM, check-in 1:00 PM) is permitted:
      // An overlap occurs only if (b.startDate < other.endDate && b.endDate > other.startDate).
      if (newStatus === "Accepted") {
        const hasOverlap = bookings.some(other => 
          other.id !== id &&
          other.berthId === b.berthId &&
          other.status === "Accepted" &&
          (b.startDate < other.endDate && b.endDate > other.startDate)
        );
        if (hasOverlap) {
          alert("Schedule Conflict: Another booking is already accepted for this berth on overlapping dates!");
          return false;
        }
      }
      b.status = newStatus;
      localStorage.setItem("anchordrop_bookings", JSON.stringify(bookings));
      return true;
    }
    return false;
  },

  reportDelay(bookingId, newEta, note) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      b.delayReport = {
        newEta: newEta,
        note: note || "No additional note.",
        reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false
      };
      localStorage.setItem("anchordrop_bookings", JSON.stringify(bookings));
      return true;
    }
    return false;
  },

  acknowledgeDelay(bookingId) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.id === bookingId);
    if (b && b.delayReport) {
      b.delayReport.acknowledged = true;
      localStorage.setItem("anchordrop_bookings", JSON.stringify(bookings));
      return true;
    }
    return false;
  }
};

// ============================================================================
// 3. COMPATIBILITY ENGINE
// ============================================================================
/**
 * Calculates vessel-to-dock suitability based on dimensions:
 * 1. Vessel Length <= Dock Max Length
 * 2. Vessel Beam (Width) <= Dock Max Beam
 * 3. Vessel Draft (Depth below water) <= Dock Minimum Water Depth
 */
function checkCompatibility(vessel, dock) {
  const errors = [];

  if (!vessel || !dock) {
    return { compatible: false, errors: ["Missing vessel or dock specification."] };
  }

  if (Number(vessel.length) > Number(dock.maxLength)) {
    errors.push(`Vessel Length (${vessel.length} ft) exceeds berth capacity of ${dock.maxLength} ft.`);
  }

  if (Number(vessel.beam) > Number(dock.maxBeam)) {
    errors.push(`Vessel Beam (${vessel.beam} ft wide) exceeds berth width of ${dock.maxBeam} ft.`);
  }

  if (Number(vessel.draft) > Number(dock.minDepth)) {
    errors.push(`Vessel Draft (${vessel.draft} ft underwater) exceeds dock minimum depth (${dock.minDepth} ft). High risk of vessel grounding!`);
  }

  return {
    compatible: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// 4. AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================
const Auth = {
  getUser() {
    const userStr = localStorage.getItem("anchordrop_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  login(user) {
    localStorage.setItem("anchordrop_user", JSON.stringify(user));
  },

  getRegisteredUsers() {
    const list = localStorage.getItem("anchordrop_registered_users");
    return list ? JSON.parse(list) : [];
  },

  register(user) {
    const users = this.getRegisteredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem("anchordrop_registered_users", JSON.stringify(users));
    this.login(user);
  },

  logout() {
    localStorage.removeItem("anchordrop_user");
    window.location.href = "login.html";
  },

  loginDemoBoater() {
    const boater = {
      name: "Captain Sarah",
      email: "sarah@boater.com",
      role: "boater"
    };
    this.login(boater);
    window.location.href = "boater-dashboard.html";
  },

  loginDemoOwner() {
    const owner = {
      name: "Marina Bay Harbor (Robert)",
      email: "robert@marina.com",
      role: "owner"
    };
    this.login(owner);
    window.location.href = "owner-dashboard.html";
  }
};

// ============================================================================
// 5. NAVBAR SYNC (AUTOMATIC LOGIN BADGE & LINKS)
// ============================================================================
function renderNavbar() {
  const user = Auth.getUser();
  const navContainer = document.querySelector(".nav-links");
  if (!navContainer) return;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  let html = `
    <a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}">Home</a>
    <a href="explore.html" class="${currentPath === 'explore.html' ? 'active' : ''}">Explore Docks</a>
    <a href="how-it-works.html" class="${currentPath === 'how-it-works.html' ? 'active' : ''}">How It Works</a>
  `;

  if (user) {
    if (user.role === "boater") {
      html += `<a href="boater-dashboard.html" class="${currentPath === 'boater-dashboard.html' ? 'active' : ''}">Boater Dashboard</a>`;
    } else {
      html += `<a href="owner-dashboard.html" class="${currentPath === 'owner-dashboard.html' ? 'active' : ''}">Owner Dashboard</a>`;
    }
    html += `
      <span class="nav-user-badge">${user.name.split(' ')[0]} (${user.role})</span>
      <a href="javascript:void(0)" onclick="Auth.logout()" style="color:#F87171; font-weight:600;">Sign Out</a>
    `;
  } else {
    html += `<a href="login.html" class="${currentPath === 'login.html' ? 'active' : ''}">Sign In</a>`;
  }

  navContainer.innerHTML = html;
}

// Global Policy Modal Helper (eliminates dated javascript:alert)
function showPolicyModal(title, message) {
  let modal = document.getElementById("globalPolicyModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "globalPolicyModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <button class="modal-close" onclick="closePolicyModal()" aria-label="Close modal">&times;</button>
        <h3 id="policyModalTitle" style="color:var(--navy); font-size:20px; margin-bottom:12px;"></h3>
        <div id="policyModalBody" style="color:var(--text-body); font-size:14px; line-height:1.6; margin-bottom:20px;"></div>
        <div style="text-align:right;">
          <button class="btn btn-primary btn-sm" onclick="closePolicyModal()">Understood</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closePolicyModal();
    });
  }
  document.getElementById("policyModalTitle").innerText = title;
  document.getElementById("policyModalBody").innerHTML = message;
  modal.classList.add("open");
}

function closePolicyModal() {
  const modal = document.getElementById("globalPolicyModal");
  if (modal) modal.classList.remove("open");
}

// Auto-run on load
document.addEventListener("DOMContentLoaded", () => {
  AnchorDropDB.init();
  renderNavbar();

  // Close modals on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach(m => m.classList.remove("open"));
    }
  });
});

// Expose globally for console inspection & debugging
if (typeof window !== "undefined") {
  window.AnchorDropDB = AnchorDropDB;
  window.checkCompatibility = checkCompatibility;
  window.Auth = Auth;
  window.showPolicyModal = showPolicyModal;
  window.closePolicyModal = closePolicyModal;
}

