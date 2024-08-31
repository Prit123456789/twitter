import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next'

function Messages() {
    const {t}=useTranslation('translations')
    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("Welcome to Messages Page")}</h2>
        </div>
    )
}

export default Messages
