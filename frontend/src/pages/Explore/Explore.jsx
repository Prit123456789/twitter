import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next'
function Explore() {
    const {t}=useTranslation('translations');
    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("Welcome to Explore Page")}</h2>
        </div>
    )
}

export default Explore
