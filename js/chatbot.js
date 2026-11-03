/* ============================================================
   Top 2 Bottom Home Solutions — website chatbot
   A scripted conversational assistant that runs ENTIRELY in the
   visitor's browser: no backend, no API keys, no third-party
   services. Every answer comes from the business's verified
   facts (the same facts published on this site). It never
   invents prices, reviews, ratings, or license claims.
   Estimate requests are handed off as a prefilled text message
   that the VISITOR sends from their own phone to Matt — nothing
   is transmitted by this script.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Verified facts ---------------- */
  var PHONE_DISPLAY = "(239) 528-7188";
  var PHONE_TEL = "tel:+12395287188";
  var SMS_NUMBER = "+12395287188";
  var EMAIL = "top2bottomhomesolutionswfl@gmail.com";
  var BIO = "I truly believe in honesty, Loyalty, integrity, and constant communication as keys factors in business and life.";
  var SERVICES = [
    "Drywall & Painting",
    "Doors & Hardware",
    "TV Mounting & Shelving",
    "Fixtures & Assembly",
    "Tile & Minor Repairs",
    "Lanai & Exterior"
  ];
  var AREAS = ["Naples", "Marco Island", "Bonita Springs", "Estero", "Fort Myers", "Cape Coral", "Golden Gate", "Lehigh Acres"];
  var MENU_CHIPS = ["Get a free estimate", "Services & prices", "Hours & service area", "Talk to Matt"];
  var SERVICE_CHIPS = SERVICES.concat(["Multiple / punch list", "Something else"]);

  function smsHref(body) {
    // "?&body=" is the cross-platform form: iOS reads "&body", Android "?body".
    return "sms:" + SMS_NUMBER + "?&body=" + encodeURIComponent(body);
  }

  function validatePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
    return digits.length === 10;
  }

  /* ---------------- Intent matching ----------------
     Returns an intent string or null. Order matters: specific
     intents are checked before broad ones. */
  function matchIntent(raw) {
    var t = " " + String(raw || "").toLowerCase().replace(/\s+/g, " ").trim() + " ";
    if (!t.trim()) return null;

    // Exact quick-reply labels
    if (t.indexOf("get a free estimate") > -1) return "estimate";
    if (t.indexOf("services & prices") > -1) return "services";
    if (t.indexOf("hours & service area") > -1) return "hours_area";
    if (t.indexOf("talk to matt") > -1) return "contact";

    // Excluded work first, so "do you do roofing?" never gets a generic answer
    if (/roof/.test(t)) return "excluded_roofing";
    if (/air condition|a\/c|hvac|aircon/.test(t) || / ac /.test(t)) return "excluded_ac";
    if (/remodel|renovation|addition/.test(t)) return "excluded_remodel";
    if (/pool/.test(t)) return "excluded_pool";
    if (/electric|plumb/.test(t)) return "licensed_trade";

    // Starting a job / booking
    if (/estimate|quote|book|appointment|schedule|hire|get started/.test(t)) return "estimate";

    // Price questions
    if (/how much|price|cost|charge|minimum|rate|expensive|cheap/.test(t)) return "pricing";

    // Greetings / thanks
    if (/^( hi| hello| hey| good morning| good afternoon| good evening)/.test(t)) return "greeting";
    if (/thank|thanks|thx/.test(t)) return "thanks";

    // Owner / about
    if (/owner|who owns|who runs|matthew|about (you|the company|your company)/.test(t)) return "owner";

    // Callback
    if (/call back|callback|how soon|how fast|response time|get back to me|hear back/.test(t)) return "callback";

    // Photos
    if (/photo|picture| pic |pics/.test(t)) return "photos";

    // Hours
    if (/hour|open|close|when are you|emergency|after hours|weekend|saturday|sunday/.test(t)) return "hours";

    // Service area
    if (/area|serve|service area|where|location|located|come to|travel|trip fee/.test(t) ||
        /naples|marco|bonita|estero|fort myers|cape coral|golden gate|lehigh/.test(t)) return "area";

    // Payments
    if (/pay|payment|credit card|debit|zelle|cash app|check|cash/.test(t)) return "payments";

    // Insurance / licensing
    if (/insur|licen[cs]e|licensed/.test(t)) return "insured";

    // Services list and individual services
    if (/service|what do you do|offer|drywall|paint|door|lock|hinge|tv|mount|shelv|curtain|mirror|ceiling fan|fixture|furniture|assembly|tile|grout|cabinet|faucet|lanai|screen|fence|gate|punch list|repair|fix|install|hang/.test(t)) return "services";

    // Contact / human
    if (/call|phone|number|email|contact|human|person|real person|talk|speak|text/.test(t)) return "contact";

    return null;
  }

  /* ---------------- Answers ----------------
     Every string below is built only from verified site facts. */
  function answerFor(intent) {
    switch (intent) {
      case "greeting":
        return { text: "Hi there! I can answer questions about our services, prices, hours, and service area, or start your free estimate request. What can I do for you?", chips: MENU_CHIPS };
      case "thanks":
        return { text: "You're welcome! Anything else I can help with?", chips: MENU_CHIPS };
      case "pricing":
        return { text: "Estimates are always free. There is a $75 minimum charge for work, and you will know the price before any work begins. For most small jobs, Matt can quote right from photos you text him.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "services":
        return { text: "We handle: " + SERVICES.join(", ") + ". We also love punch lists, several small jobs knocked out in one visit. Want a free estimate on something?", chips: ["Get a free estimate", "Hours & service area", "Talk to Matt"] };
      case "excluded_roofing":
        return { text: "Roofing is one thing we do not do. For exterior work we do handle lanai and exterior repairs and touch-ups. If your job is on the ground, Matt is happy to take a look. You can reach him at " + PHONE_DISPLAY + ".", chips: ["Get a free estimate", "Talk to Matt"] };
      case "excluded_ac":
        return { text: "AC work is one thing we do not do. We do install ceiling fans and light fixtures, though. For AC help you will want an HVAC company. Anything else around the house, Matt is at " + PHONE_DISPLAY + ".", chips: ["Get a free estimate", "Talk to Matt"] };
      case "excluded_remodel":
        return { text: "Full remodels are one thing we do not take on. We are set up for repairs, updates, and punch lists instead, and those we are happy to quote for free.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "excluded_pool":
        return { text: "Pool work is one thing we do not do. We do handle lanai and exterior work around the pool area, like screen doors, gates, and touch-ups. Matt can tell you more at " + PHONE_DISPLAY + ".", chips: ["Get a free estimate", "Talk to Matt"] };
      case "licensed_trade":
        return { text: "Electrical and plumbing are not part of our regular service list. For jobs that need a permit or a specialized trade license, we coordinate with a licensed professional. Matt can talk it through at " + PHONE_DISPLAY + ".", chips: ["Get a free estimate", "Talk to Matt"] };
      case "hours":
        return { text: "We work by appointment only, Monday through Sunday, so call or text and we will book a time that works for you. We are closed on major holidays. After-hours emergency? Call anytime at " + PHONE_DISPLAY + " and we will do our best to help.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "hours_area":
        return { text: "Hours: by appointment only, Monday through Sunday; closed on major holidays; after-hours emergencies, call anytime. Area: we serve " + AREAS.join(", ") + ", all of Southwest Florida. A trip fee may apply for farther jobs, based on distance.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "area":
        return { text: "We serve " + AREAS.join(", ") + ", all of Southwest Florida. A trip fee may apply for farther jobs, based on distance. Not sure you are in range? Call or text " + PHONE_DISPLAY + " and ask.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "payments":
        return { text: "We accept Cash, Check, Card, Zelle, and Cash App. Estimates are always free, and there is a $75 minimum charge for work.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "insured":
        return { text: "Yes, Top 2 Bottom Home Solutions is insured. For jobs that need a permit or a specialized trade license, we coordinate with a licensed professional.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "callback":
        return { text: "We call back within 24 hours. For the fastest answer, call or text " + PHONE_DISPLAY + ".", chips: ["Get a free estimate", "Talk to Matt"] };
      case "photos":
        return { text: "Yes. For most small jobs, Matt can quote right from photos. If you start a free estimate here, your text app will open with your request filled in, and you can attach your job photos to that text before you send it.", chips: ["Get a free estimate", "Talk to Matt"] };
      case "owner":
        return { text: "The owner is Matthew Collins. In his words: \"" + BIO + "\"", chips: ["Get a free estimate", "Talk to Matt"] };
      case "contact":
        return { text: "You can call or text Matt at " + PHONE_DISPLAY + ", or email " + EMAIL + ". We call back within 24 hours. Or I can start your free estimate request right here.", chips: ["Get a free estimate", "Services & prices"] };
      default:
        return null;
    }
  }

  var FALLBACK = {
    text: "I don't know that one, and I don't want to guess. Matt can answer it at " + PHONE_DISPLAY + ", or I can start your free estimate request right here.",
    chips: MENU_CHIPS
  };

  /* ---------------- Guided estimate flow ----------------
     A small state machine. handle(input) returns
     { messages: [..], chips: [..], complete: bool }. */
  function createFlow() {
    var data = { service: "", details: "", when: "", name: "", phone: "" };
    var step = "service";
    var complete = false;

    function summaryText() {
      return "Here is your free estimate request:\n" +
        "Service: " + data.service + "\n" +
        "Project: " + data.details + "\n" +
        "Preferred time: " + data.when + "\n" +
        "Name: " + data.name + "\n" +
        "Phone: " + data.phone;
    }
    function smsBody() {
      return "Quote request \u2014 " + data.service + "\n\n" +
        "Name: " + data.name + "\n" +
        "Phone: " + data.phone + "\n" +
        "Service: " + data.service + "\n" +
        "Preferred time: " + data.when + "\n\n" +
        "Project details:\n" + data.details;
    }

    return {
      data: data,
      isComplete: function () { return complete; },
      currentStep: function () { return step; },
      start: function () {
        return {
          messages: ["Let's get your free estimate started. Estimates are always free, and Matt calls back within 24 hours.", "What kind of work do you need? Tap one, or type it in."],
          chips: SERVICE_CHIPS
        };
      },
      handle: function (raw) {
        var input = String(raw || "").trim();
        if (!input) return { messages: [], chips: null };
        switch (step) {
          case "service":
            data.service = input;
            step = "details";
            return { messages: ["Got it: " + input + ". Tell me a little about the project. What needs doing, and anything Matt should know?"], chips: [] };
          case "details":
            data.details = input;
            step = "when";
            return { messages: ["Thanks. What day or time works best for you? Type it in, or tap Flexible."], chips: ["Flexible"] };
          case "when":
            data.when = input;
            step = "name";
            return { messages: ["Almost done. What is your name?"], chips: [] };
          case "name":
            data.name = input;
            step = "phone";
            return { messages: ["And the best phone number to reach you, " + data.name.split(" ")[0] + "?"], chips: [] };
          case "phone":
            if (!validatePhone(input)) {
              return { messages: ["That number looks a little short. Could you type the full phone number, area code included?"], chips: [] };
            }
            data.phone = input;
            step = "done";
            complete = true;
            return {
              messages: [
                summaryText(),
                "Tap the button below and your text app will open with this request filled in for Matt at " + PHONE_DISPLAY + ". Attach any photos of the job to that text before you send it. Nothing is sent until you tap send in your text app."
              ],
              chips: ["Start a new request", "Done"],
              summary: { data: Object.assign({}, data), smsHref: smsHref(smsBody()), smsBody: smsBody(), telHref: PHONE_TEL }
            };
          default:
            return { messages: [], chips: null };
        }
      }
    };
  }

  /* Expose the pure logic (used by the UI below and by tests). */
  var api = {
    matchIntent: matchIntent,
    answerFor: answerFor,
    createFlow: createFlow,
    validatePhone: validatePhone,
    smsHref: smsHref,
    FALLBACK: FALLBACK,
    MENU_CHIPS: MENU_CHIPS,
    SERVICE_CHIPS: SERVICE_CHIPS
  };
  if (typeof window !== "undefined") window.T2BChat = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  /* ---------------- Chat UI ---------------- */
  var launcher = document.getElementById("chat-launcher");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var log = document.getElementById("chat-log");
  var chipsBox = document.getElementById("chat-chips");
  var form = document.getElementById("chat-input-form");
  var input = document.getElementById("chat-text");
  if (!launcher || !panel || !log || !chipsBox || !form || !input) return;

  var started = false;
  var flow = null;

  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addMsg(text, who) {
    var p = document.createElement("p");
    p.className = "msg msg--" + who;
    p.textContent = text;
    log.appendChild(p);
    scrollLog();
    return p;
  }

  function setChips(labels) {
    chipsBox.innerHTML = "";
    (labels || []).forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = label;
      b.addEventListener("click", function () { handleUserText(label); });
      chipsBox.appendChild(b);
    });
  }

  function showTypingThen(fn) {
    var t = document.createElement("div");
    t.className = "chat-typing";
    t.setAttribute("aria-hidden", "true");
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    scrollLog();
    setTimeout(function () {
      t.remove();
      fn();
      scrollLog();
    }, 550);
  }

  function botReply(result, after) {
    if (!result) return;
    var messages = result.messages || (result.text ? [result.text] : []);
    var i = 0;
    function next() {
      if (i >= messages.length) {
        if (result.summary) addSummaryActions(result.summary);
        if (result.chips) setChips(result.chips);
        if (after) after();
        return;
      }
      var msg = messages[i++];
      showTypingThen(function () { addMsg(msg, "bot"); next(); });
    }
    next();
  }

  function addSummaryActions(summary) {
    var wrap = document.createElement("div");
    wrap.className = "chat-actions";
    var a = document.createElement("a");
    a.className = "btn btn--primary btn--block";
    a.href = summary.smsHref;
    a.textContent = "Text this to Matt";
    var c = document.createElement("a");
    c.className = "btn btn--outline btn--block";
    c.href = summary.telHref;
    c.textContent = "Call " + PHONE_DISPLAY + " instead";
    wrap.appendChild(a);
    wrap.appendChild(c);
    log.appendChild(wrap);
    scrollLog();
  }

  function startFlow() {
    flow = createFlow();
    botReply(flow.start());
  }

  function endFlowToMenu(closingLine) {
    flow = null;
    botReply({ text: closingLine, chips: MENU_CHIPS });
  }

  function handleUserText(raw) {
    var text = String(raw || "").trim();
    if (!text) return;
    addMsg(text, "user");
    input.value = "";

    if (flow && !flow.isComplete()) {
      if (/^(cancel|start over|menu|never mind|stop)$/i.test(text)) {
        endFlowToMenu("No problem, I cancelled that request. What else can I do for you?");
        return;
      }
      botReply(flow.handle(text));
      return;
    }
    if (flow && flow.isComplete()) {
      flow = null;
      if (/^done$/i.test(text)) {
        botReply({ text: "You're all set. Thanks for reaching out to Top 2 Bottom Home Solutions!", chips: MENU_CHIPS });
        return;
      }
      if (!/start a new request/i.test(text)) {
        // fall through and treat as a fresh question
      } else {
        startFlow();
        return;
      }
    }

    var intent = matchIntent(text);
    if (intent === "estimate") { startFlow(); return; }
    var answer = intent ? answerFor(intent) : null;
    botReply(answer || FALLBACK);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleUserText(input.value);
  });

  function greet() {
    botReply({
      text: "Hi! I'm the Top 2 Bottom Home Solutions chatbot. I can answer questions about services, prices, hours, and our service area, or start your free estimate request right here. What can I do for you?",
      chips: MENU_CHIPS
    });
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      if (!started) { started = true; greet(); }
      input.focus();
    }
  }

  launcher.addEventListener("click", function () { setOpen(panel.hidden); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); launcher.focus(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { setOpen(false); launcher.focus(); }
  });
  // Allow demos/tests to open the panel directly: page.html?chat=open
  if (/[?&]chat=open/.test(window.location.search)) setOpen(true);
})();
