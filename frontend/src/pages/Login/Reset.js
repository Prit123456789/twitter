import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from '@mui/icons-material/Twitter';
import './Reset.css'

function Reset() {
  const auth= getAuth();
  const [email,setEmail]= useState();
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    sendPasswordResetEmailWithLimit(email);
  };

  const sendPasswordResetEmailWithLimit = (email) => {
    const lastSentTimestamp = localStorage.getItem(`passwordResetEmailSent_${email}`);
    const now = new Date().getTime();

    if (lastSentTimestamp) {
      const timeDiff = now - parseInt(lastSentTimestamp);
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        alert('Password reset email already sent within the last 24 hours.');
        return;
      }
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        localStorage.setItem(`passwordResetEmailSent_${email}`, now.toString());
        alert('Password reset email sent successfully.');
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error);
      });
  };
  const [password, setPassword] = useState('');

  const generatePassword = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    return newPassword;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12); 
    setPassword(newPassword);
  };
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password)
      .then(() => {
        alert('Password copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy password: ', err);
      });
  };
  
  return (
    <div className='reset-container'>
        <div className="image-container">
                    <img className=" image" src={twitterimg} alt="twitterImage" />
                </div>
      <div className='reset-form'> 
      <div className="form-box" >
      <TwitterIcon style={{ color: "skyblue" }} />        
      <h2>Reset Password</h2>
      <h4>Find your account and reset your password</h4>
      <form onSubmit={handlePasswordReset}>
        <input 
        type= 'email'
        className='email'
        placeholder='Enter your email'
        onChange={(e)=>setEmail(e.target.value)}
        />
        <div className='btn-login'>
          <button type="submit" id='sendEmailButton' className='btn'>Submit</button>
        </div>
        </form>
    </div>
    <Link                   
                            to="/login"
                            style={{
                                textDecoration: 'none',
                                color: 'var(--twitter-color)',
                                fontWeight: '600',
                                marginLeft: '200px'
                            }}
                        >
                            Back to login page
                        </Link>
                        <hr />
    <div className='gen-container'>
      <button className='pass-gen' onClick={handleGeneratePassword}>Generate Password</button>
      {password && (
        <div>
          <div  style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={password}
              readOnly
              className='gen-text'
            />
            <button className='pass-copy' onClick={handleCopyPassword}>Copy</button>
          </div>
        </div>
      )}
    </div> </div>
  
    </div>
  );
}
export default Reset;
