import React, { useState } from 'react';

 interface Voucher {
     id: string;
     date: string;
     amount: number;
     description: string;
 }
 
 const PurchaseReturn: React.FC = () => {
     const [voucher, setVoucher] = useState<Voucher>({
         id: '',
         date: '',
         amount: 0,
         description: ''
     });
 
     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setVoucher({ ...voucher, [name]: value });
     };
 
     const handleExport = () => {
         const fileName = 'voucher.json';
         const json = JSON.stringify(voucher, null, 2);
         const blob = new Blob([json], { type: 'application/json' });
         const href = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = href;
         link.download = fileName;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     };
 
     return (
         <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc' }}>
             <h2>Purchase Voucher</h2>
             <form>
                 <div>
                     <label>Voucher ID:</label>
                     <input 
                         type="text" 
                         name="id" 
                         value={voucher.id} 
                         onChange={handleChange} 
                         style={{ width: '100%', padding: '8px', marginBottom: '10px' }} 
                     />
                 </div>
                 <div>
                     <label>Date:</label>
                     <input 
                         type="date" 
                         name="date" 
                         value={voucher.date} 
                         onChange={handleChange} 
                         style={{ width: '100%', padding: '8px', marginBottom: '10px' }} 
                     />
                 </div>
                 <div>
                     <label>Amount:</label>
                     <input 
                         type="number" 
                         name="amount" 
                         value={voucher.amount} 
                         onChange={handleChange} 
                         style={{ width: '100%', padding: '8px', marginBottom: '10px' }} 
                     />
                 </div>
                 <div>
                     <label>Description:</label>
                     <textarea 
                         name="description" 
                         value={voucher.description} 
                         onChange={handleChange} 
                         style={{ width: '100%', padding: '8px', marginBottom: '10px' }} 
                     />
                 </div>
                 <button type="button" onClick={handleExport} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                     Export as JSON
                 </button>
             </form>
         </div>
     );
 };
 
 export default PurchaseReturn;
 