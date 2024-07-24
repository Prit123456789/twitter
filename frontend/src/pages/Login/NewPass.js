import React from 'react'
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from '@mui/icons-material/Twitter';
import './NewPass.css'

const NewPass = () => {
    
    return (
        <div className='login-container'>
           <div className='image-container'>
              <img className='image' src={twitterimg} alt='Twitter Image'/>
           </div>
           <div className='form-container'>
               <div className='form-box'>
                   <TwitterIcon style={{color: 'skyblue'}}/>
                   <h2>Reset Password</h2>
                   <form >
                       <input
                       className='password'
                       type="password"
                       placeholder='Enter New Password'
                       />
                       <input
                       className='password'
                       type='password'
                       placeholder='Re-enter New Password'
                       />                       
                   </form>
                   <div className='btn-login'>
                   <button className='btn'>Submit</button>
                   </div>
               </div>
           </div>
            
        </div>
    )
}

export default NewPass;
