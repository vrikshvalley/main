"use client"

import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import './addProductModal.css';
// eslint-disable-next-line react/prop-types
const AddProductsModal = ({ closeModal }) => {
  
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const [image, setImage] = useState(null);
    const[imagePreview, setImagePreview] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [size, setSize] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState(0);  
    const [disable, setDisable] = useState(true);
    
    const showToast = (message) => {
        toast(message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
    };
    
    function Modal() {
        closeModal();
    }
    const handleImageChange = async(e) => {
        setImage(e.target.files[0]);
        const file = e.target.files[0];
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append('upload_preset', uploadPreset);
        
        formData.append('file', file);
        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData
            );
            const imageUrl = response.data.secure_url;
            setImageUrl(imageUrl);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
            setDisable(false);
            window.alert('Image uploaded successfully', imageUrl);
            console.log('Image uploaded successfully', imageUrl);
        } catch (error) {
            console.log('Error uploading image to Cloudinary: ', error.message);
          window.alert('Image not uploaded successfully');
          
            // setImage(null);
            // setImagePreview(null);
        } 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Make request to save product with image URL
        const productData = {
            image: imageUrl,
            name,
            description,
            quantity,
            size,
            price,
          
        };

        try {
            await axios.post('http://localhost:5000/products', productData);
            // Reset form fields
            setImage(null);
            setName('');
            setDescription('');
            setQuantity(0);
            setSize('');
            setPrice(0);
            closeModal();
            showToast('Product added successfully');
        } catch (error) {
            console.error('Error saving product: ', error);
            showToast('Error saving product!!!');
        }
        
    };
    const elementStyle = {
        display: disable ? 'block' : 'none'
        
      };

      

    return (
        <div style={{ padding: '20px', backgroundColor: '#a1b698', color: '#fff', borderRadius: '8px', width: '600px', maxWidth: '90%' }}>
            <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
            <h2>Add Product</h2>
            <div style={{ display: 'flex', justifyContent:"space-between", gap:"50px", alignItems:"center" }}>
                <div className='addImage'>
                    {imagePreview ? (<img src={imagePreview} alt="Product" style={{ width: '200px' }} />) : (
                        <label style={elementStyle} htmlFor="image"> : Add Image</label>)}
                    <input style={elementStyle} type="file" id="image" onChange={handleImageChange} />
                    
                </div>


            <form onSubmit={handleSubmit}>
               
                <div>
                    <label htmlFor="name">Product Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="description">Product Description:</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="quantity">Quantity:</label>
                    <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="size">Size:</label>
                    <input type="text" id="size" value={size} onChange={(e) => setSize(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="price">Price:</label>
                    <input type="text"  id="price" value={price} placeholder='Enter Price' onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className='buttons-submit'>
                <button disabled={disable}  type="submit">Submit</button>
                <div className='button2' onClick={Modal}>Cancel</div>
                </div>
                </form>
                </div>
        </div>
    );
};

export default AddProductsModal;