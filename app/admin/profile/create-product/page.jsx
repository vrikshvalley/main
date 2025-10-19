'use client'

import Modal from 'react-modal';
import { useState } from 'react';
import AddProductsModal from '@/components/admin/CreateProduct';

export default function AddItemButton () {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    function OpenModal() {
        setModalIsOpen(true);
    }
    function CloseModal() {
        setModalIsOpen(false);
    }
Modal.setAppElement('body');
    return (
        <div style={{padding:"20px", maxWidth:"600px", margin:"120px auto", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-start", gap:"20px", backgroundColor:"#f0f0f0", borderRadius:"10px"}}>
            <h2 style={{ fontFamily:'Roboto, sans-serif', fontWeight:'bold', fontSize:'24px', padding:'10px'
            }}>Add an Item</h2>
            <h5 style={{ 
                fontFamily:'Nunito, sans-serif', fontWeight:'semi-bold', fontSize:'12px', padding:'10px'}}>Add New Item to Inventory</h5>
            <button
                style={{ backgroundColor: 'green', color: 'white', fontFamily:'Nunito, sans-serif', fontWeight:'regular', fontSize:'16px', padding:'10px', borderRadius:'5px', border:'none', cursor:'pointer'}}
                onClick={OpenModal}
            >
                Add item
            </button>
            <Modal className="modal" style={{ overlay: { backgroundColor: "rgba(0,0,0,0.5)", alignItems:'center' } }} isOpen={modalIsOpen} onRequestClose={CloseModal} >
            <AddProductsModal closeModal={CloseModal} />
            </Modal>
        </div>
    );
}

