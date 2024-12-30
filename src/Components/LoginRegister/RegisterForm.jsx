import React, { useEffect, useState } from 'react';
import { FaUser, FaUnlockAlt, FaBirthdayCake, FaTransgender, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.css';


const RegisterForm = ({ toggleForm }) => {
    useEffect(() => {
        document.title = 'Register';
    }, []);

    const [formData, setFormData] = useState({
        username: "",
        name: "",
        surname: "",
        phonenumber: "",
        password: "",
        budget:"",
        
    });

   

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const usersResponse = await fetch('/all-customers'); 
          const usersData = await usersResponse.json();
  
          if (!usersData.success) {
              console.log(usersData.customers)
              alert("Kullanıcıları alırken bir hata oluştu.");
              return;
          }
  
          const existingUser = usersData.customers.find(customers => 
            customers.Username === formData.username || 
            customers.PhoneNumber === formData.phonenumber
          );
  
          if (existingUser) {
              alert("Bu kullanıcı adı, e-posta ya da telefon numarası zaten kullanılıyor.");
              return;
          }
  
          const response = await fetch("/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData)
          });
          const data = await response.json();
  
          console.log(data);
          
          if (data.success) {
              const userId = data.userId;
  
              console.log(userId);
                alert("Registration successful.");
  
              navigate("/login");
          } else {
              alert("Registration failed.");
          }
      } catch (error) {
          console.error("Error during registration:", error);
      }
  };

    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
          <div className={styles.form_box}>
            <form onSubmit={handleSubmit}>
              <h1 style={{ textAlign: 'center',}}>
                Registration
              </h1>
              <div className={styles.input_group}>
                
                <div className={styles.input_box}>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    name="username"
                    required 
                    onChange={handleChange} 
                  />
                  <FaUser className={styles.icon} />
                </div>
                <div className={styles.input_box}>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    name="name" 
                    required 
                    onChange={handleChange} 
                  />
                  <FaUser className={styles.icon} />
                </div>
                <div className={styles.input_box}>
                  <input 
                    type="text" 
                    placeholder="Surname" 
                    name="surname" 
                    required 
                    onChange={handleChange} 
                  />
                  <FaUser className={styles.icon} />
                </div>
                
      
                
                
                <div className={styles.input_box}>
                  <input 
                    type="text" 
                    placeholder="Phone Number" 
                    name="phonenumber" 
                    required 
                    onChange={handleChange} 
                  />
                  <FaPhone className={styles.icon} />
                </div>
               
                <div className={styles.input_box}>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    name="password" 
                    required 
                    onChange={handleChange} 
                  />
                  <FaUnlockAlt className={styles.icon} />
                </div>
      
                
                <div className={styles.input_box}>
                  <input 
                    type="text" 
                    placeholder="Budget" 
                    name="budget" 
                    required 
                    onChange={handleChange} 
                    className={styles.large_input}
                  />
                  <FaMapMarkerAlt className={styles.icon} />
                </div>
      
               
              </div>
      
              <div className={styles.remember_forgot}>
                <label><input type="checkbox" required /> I agree to the terms & conditions</label>
              </div>
              <button type="submit">Register</button>
              <div className={styles.register_link}>
                <p>Already have an account? <span onClick={() => navigate("/login")} style={{ cursor: 'pointer' }}>Login</span></p>
              </div>
            </form>
          </div>
      
          
        </div>
    );
};

export default RegisterForm;
