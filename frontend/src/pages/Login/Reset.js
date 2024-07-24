import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from '@mui/icons-material/Twitter';
import './Reset.css'

function Reset() {
  const [email, setEmail] = useState('');
  const auth = getAuth();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Error sending password reset email');
    }
  };

  return (
    <div className='reset-container'>
        <div className="image-container">
                    <img className=" image" src={twitterimg} alt="twitterImage" />
                </div>
      <div className='reset-form'> 
      <div className="form-box" >
      <TwitterIcon style={{ color: "skyblue" }} />        
      <h1>Reset Password</h1>
      <input className='email' type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleResetPassword} className='btn'>Submit</button>
    </div> </div>
    </div>
  );
}
export default Reset;
