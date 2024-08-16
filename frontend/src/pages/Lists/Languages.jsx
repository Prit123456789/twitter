import React from 'react'
import './Languages.css'
import {useTranslation} from 'react-i18next';

function Langs() {
    const {t,i18n}=useTranslation()
    const language=[
        {code:"en",lang:"English"},
        {code:"fr",lang:"Français"},
        {code:"sp",lang:"Español"},
        {code:"po",lang:"Português"},
        {code:"ch",lang:"Chinese"},
        {code:"hi",lang:"हिन्दी"},
        {code:"te",lang:"తెలుగు"},
        {code:"ta",lang:"தமிழ்"}
    ]
   
    
    return (
        <div class="language-selector">
        <h2 class="select-language">{t("Select Language")}</h2>
        <div class="language-list">
          {language.map((lng)=>{
            return <button className='btn-lang' onClick={()=>i18n.changeLanguage(lng?.code)}>
                {lng?.lang}
            </button>
          })}      
        </div>
      </div>
      
    )
}

export default Langs;
