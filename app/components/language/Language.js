// languages.js

const langData = {
  "en": {
    "title": "WalletXpress",
    "landingPage": {
      "section1": {
        "title": "Ops! Bank server Error? and you don't have cash? Don't worry, Here we have WalletXpress!",
        "desc": "WalletXpress is the app that allows you to conduct online transactions without involving banks. Send and receive money through your e-wallet, no more bank hassles."
      },
      "keyFeature": {
        "title": "Key Features of WalletXpress",
        "desc": "WalletXpress Offers a seamsless and secure way to manage your finances without the hassle of banks",
        "features": [
          {
            "title": "E-wallet",
            "desc": "Easily recharge your e-wallet and use it to send and receive money without involving banks",
            "img":"/landingPage/wallet.jpg"
          },
          {
            "title": "Instant Transections",
            "desc": "Enjoy lightning-fast transactions with WalletXpress, no more waiting for bank approvals.",
            "img":"/landingPage/instant.png"
          },
          {
            "title": "Secure Payments",
            "desc": "Your financial data is protected with advanced security measures, ensuring your transactions are safe.",
            "img":"/landingPage/bank.jpg"
          }
        ]
      },
      "workFlow": {
        "title": "How WalletXpress Works",
        "desc": "Discover the simple steps to start using WalletXpress and manage your finances with ease",
        "steps": [
          {
            "title": "Recharge Your Wallet",
            "desc": "Top up your e-wallet with just a few taps, no need to visit a bank."
          },
          {
            "title": "Send or Recieve Money",
            "desc": "Easily transfer to your friends, family, or businesses using your e-wallet."
          },
          {
            "title": "Withdraw Funds",
            "desc": "Withdraw funds from your e-wallet directly to your bank account."
          }
        ]
      },
      "review": {
        "title": "What Our Users Say",
        "desc": "Hear from our satisfied cunsomers and see why the love using WalletXpress"
      }
    },
    "getStartedWithPaymentKaro": "Get Started with WalletXpress",
    "getStarted": "Get Started",
    "learnMore": "Learn More",
    "Home": "Home",
  },
  "hindi": {
    "title": "WalletXpress",
    "landingPage": {
      "section1": {
        "title": "ओह! बैंक सर्वर में त्रुटि? और आपके पास नकद नहीं है? चिंता न करें, यहाँ हमारे पास है WalletXpress!",
        "desc": "WalletXpress एक ऐसा ऐप है जो आपको बिना बैंक की भागीदारी के ऑनलाइन लेनदेन करने की अनुमति देता है। अपने ई-वॉलेट के माध्यम से पैसे भेजें और प्राप्त करें, अब बैंक की झंझट नहीं।"
      },
      "keyFeature": {
        "title": "WalletXpress की प्रमुख विशेषताएँ",
        "desc": "WalletXpress बैंक की झंझट के बिना आपके वित्त को प्रबंधित करने का एक सरल और सुरक्षित तरीका प्रदान करता है।",
        "features": [
          {
            "title": "ई-वॉलेट",
            "desc": "अपना ई-वॉलेट आसानी से रिचार्ज करें और बैंक की भागीदारी के बिना पैसे भेजने और प्राप्त करने के लिए इसका उपयोग करें।"
          },
          {
            "title": "तुरंत लेनदेन",
            "desc": "WalletXpress के साथ बिजली की गति से लेनदेन करें, अब बैंक अनुमोदनों का इंतजार नहीं करना पड़ेगा।",
          },
          {
            "title": "सुरक्षित भुगतान",
            "desc": "आपके वित्तीय डेटा को उन्नत सुरक्षा उपायों से संरक्षित किया गया है, जिससे आपके लेनदेन सुरक्षित रहते हैं।"
          }
        ]
      },
      "workFlow": {
        "title": "WalletXpress कैसे काम करता है",
        "desc": "WalletXpress का उपयोग शुरू करने और अपने वित्त को आसानी से प्रबंधित करने के सरल चरणों की खोज करें",
        "steps": [
          {
            "title": "अपना वॉलेट रिचार्ज करें",
            "desc": "कुछ ही टैप्स में अपना ई-वॉलेट रिचार्ज करें, बैंक जाने की कोई आवश्यकता नहीं।"
          },
          {
            "title": "पैसे भेजें या प्राप्त करें",
            "desc": "अपने ई-वॉलेट का उपयोग करके अपने दोस्तों, परिवार, या व्यवसायों को आसानी से पैसे ट्रांसफर करें।"
          },
          {
            "title": "फंड निकालें",
            "desc": "अपने ई-वॉलेट से सीधे अपने बैंक खाते में फंड निकालें।"
          }
        ]
      },
      "review": {
        "title": "हमारे उपयोगकर्ता क्या कहते हैं",
        "desc": "हमारे संतुष्ट ग्राहकों से सुनें और जानें कि वे WalletXpress का उपयोग क्यों पसंद करते हैं"
      }
    },
    "getStartedWithPaymentKaro": "शुरुआत करें WalletXpress के साथ!",
    "getStarted": "शुरू करें",
    "learnMore": "और अधिक जानें",
    "Home": "होम",
  }
}
// Function to set the language key (e.g., 'en', 'hindi') in local storage
function setLanguage(language) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('language', language);
    window.location.reload();
  }
}

// Function to get the selected language key from local storage
function getLanguage() {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('language') || 'en'; // default to 'en'
  }
  return 'en'; // Return default 'en' if on server
}

// Function to get the selected language object from lang.json
function getLang() {
  const selectedLanguage = getLanguage();
  return selectedLanguage === 'en' ? langData.en : langData.hindi; // default to 'en' if invalid language is stored
}

// Example usage:
// setLanguage('hindi'); // To set the language
// const lang = getLang(); // To get the language object based on the selected language

export { setLanguage, getLanguage, getLang };


