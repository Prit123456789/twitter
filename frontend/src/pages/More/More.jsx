import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next'
function More() {
    const {t}=useTranslation('translations');
    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("Welcome to More Page")}</h2>
        </div>
    )
}

export default More
