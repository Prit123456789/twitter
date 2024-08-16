import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// import { init } from 'i18next';

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    debug: true,
    fallbackLng: 'en',
    interpolation:{
        ecapeValue: false, 
    },
    react: {
        wait: true,
        useSuspense: false,
     },
    resources:{
        en:{
            translations:{
                greeting: "Hello"
            }
        },
        hi:{
            translations:{
                greeting: "नमस्ते",
                Home:"होम",
                Explore:"एक्सप्लोर करें",
                Notifications:"सूचनाएँ",
                Messages:"संदेश",
                Bookmarks:"बुकमार्क",
                Languages:"भाषाएँ",
                Profile:"प्रोफ़ाइल",
                More:"अधिक",
                ChatBot:"चैटबॉट",
                'Select Language':"भाषा चुने",
            }
        },
        fr:{
            translations:{
                greeting: "Bonjour",
                Home:"Maison",
                Explore:"Explorer",
                Notifications:"Notifications",
                Messages:"Messagerie",
                Bookmarks:"Signets",
                Languages:"Langages",
                Profile:"Profil",
                More:"Plus",
                ChatBot:"ChatBot",
                'Select Language':"Sélectionner la langue",
            }
        },
        sp:{
            translations:{
                greeting: "Hola",
                Home:"Inicio",
                Explore:"Explorar",
                Notifications:"Notificaciones",
                Messages:"Mensan",
                Bookmarks:"Marcadores",
                Languages:"Idiomas",
                Profile:"Perfil",
                More:"Más",
                ChatBot:"Bot de chat",
                'Select Language':"Seleccione idioma",
            }
        },
        po:{
            translations:{
                greeting: "Olá",
                Home:"Página inicial",
                Explore:"Explorar",
                Notifications:"Notificações",
                Messages:"Mensagens",
                Bookmarks:"Favoritos",
                Languages:"Idiomas",
                Profile:"Perfil",
                More:"Mais",
                ChatBot:"Chatbot",
                'Select Language':"Selecione o idioma",
            }
        },
        ch:{
            translations:{
                greeting: "你好",
                Home:"主頁",
                Explore:"探索",
                Notifications:"通知",
                Messages:"訊息",
                Bookmarks:"書籤",
                Languages:"語言",
                Profile:"個人資料",
                More:"更多",
                ChatBot:"聊天機器人",
                'Select Language':"選擇語言",
            }
        },
        te:{
            translations:{
                greeting: "నమస్కారం",
                Home:"హోమ్",
                Explore:"అన్వేషించండి",
                Notifications:"నోటిఫికేషన్‌లు",
                Messages:"సందేశాలు ",
                Bookmarks:"బుక్‌మార్క్‌లు",
                Languages:"భాషలు",
                Profile:"ప్రొఫైల్",
                More:"మరిన్ని",
                ChatBot:"చాట్‌బాట్",
                'Select Language':"భాషను ఎంచుకోండి",
            }
        },
        ta:{
           translations: {
                greeting: "வணக்கம்",
                Home:"முகப்பு",
                Explore:"ஆராயுங்கள்",
                Notifications:"அறிவிப்புகள்",
                Messages:"செய்திகள்",
                Bookmarks:"புக்மார்க்குகள்",
                Languages:"மொழிகள்",
                Profile:"சுயவிவரம்",
                More:"மேலும்",
                ChatBot:"சாட்பாட்",
                'Select Language':"மொழியைத் தேர்ந்தெடுக்கவும்",
        }
    }
}
});


export default i18n;
