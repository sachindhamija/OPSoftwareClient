import { useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
import CustomButton from "../../../app/components/CustomButton";

interface PrintInvoicePageProps { }

export function PrintInvoicePage({ }: PrintInvoicePageProps) {
  const accessId = getAccessIdOrRedirect();
  const rawVoucherId: string | null = sessionStorage.getItem("voucherId");
  const voucherId = rawVoucherId ? JSON.parse(rawVoucherId) : null;

  const [voucherData, setVoucherData] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const data = await agent.SalePurchase.getVoucherById(accessId, voucherId ?? "");
        console.log("data")
        console.log(data)
        setVoucherData(data);
      } catch (error) {
        console.error("Error fetching voucher:", error);
      }
    };

    const getCompanyDetails = async () => {
      try {
        const companyInfo = await agent.Company.getCompanyDetail(accessId);
        setCompanyInfo(companyInfo);
        console.log("companyInfo")
        console.log(companyInfo)
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    getCompanyDetails();
    fetchVoucher();
  }, [accessId, voucherId]);

  // If voucher data isn't yet available, return null or a loading state
  if (!voucherData) return <div>Loading...</div>;

  // Extract data from voucherData
  const {
    voucherDate,
    customerDetailDto,
    items,
    transportDetailDto,
  } = voucherData;

  const customerName = customerDetailDto?.customerName || "";
  const customerAddress = customerDetailDto?.customerAddress || "";
  const customerGSTNo = customerDetailDto?.customerGSTNo || "";
  const customerPAN = customerDetailDto?.customerPAN || "";
  //const customerAadhar = customerDetailDto?.customerAadhar || "";

  const transportDetails = transportDetailDto || {};

  const formattedVoucherDate = new Date(voucherDate).toLocaleDateString();

  const totalAmountBeforeTax = items?.reduce((sum: number, item: any) => sum + item.basicAmount, 0) || 0;
  const totalGST = items?.reduce((sum: number, item: any) => sum + item.sgst + item.cgst + item.igst, 0) || 0;
  const totalAmount = totalAmountBeforeTax + totalGST;

  const invoiceHtml = `
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <style>

       body {
        font-family: "Arial", sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 0;
      }
      .invoice-container {
        padding: 20px;
        border: 2px solid black;
      }
      .main-container {
        max-width: 1050px;
        margin: 20px auto;
        background: white;
        padding: 30px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        align-items: start;
      }
      .header .left,
      .header .right {
        width: 48%;
      }
      .header .center {
        width: 48%;
        text-align: center;
      }
      .header .center h1 {
        font-size: 30px;
        color: #333;
        margin: 0;
        font-weight: bold;
      }
      .header .center p {
        font-size: 16px;
        color: #555;
        margin: 5px 0;
      }
      .header .left {
        font-size: 14px;
        text-align: left;
      }
      .header .right {
        font-size: 14px;
        text-align: right;
      }
      .party-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        font-size: 14px;
        border: 1px solid black;
      }
      .party-details .left-column,
      .party-details .right-column {
        width: 48%;
        padding: 15px;
       }
      .right-column {
        padding-left: 25px;
        display: flex;
        border-left: #333 solid 1px;
        justify-content: space-between;
      }
      .right-column .box {
        width: 48%;
        padding: 15px;
       }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      table,
      th,
      td {
        border: 1px solid #ddd;
      }
      th,
      td {
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
        font-weight: bold;
        color: #333;
      }
      .strong {
        margin-bottom: 10px;
      }
      td {
        color: #555;
      }
      .totals td {
        font-size: 16px;
        font-weight: bold;
        padding-top: 10px;
      }
      .summary-section {
        margin-top: 30px;
        display: flex;
        justify-content: space-between;
      }
      .summary-section .left,
      .summary-section .right {
        width: 48%;
      }
      .summary-section table {
        width: 100%;
        margin-top: 10px;
      }
      .summary-section td {
        padding: 8px;
        text-align: left;
      }
      .bill-amount {
        margin-top: 30px;
        font-size: 22px;
        font-weight: bold;
        text-align: right;
        color: #333;
      }
      .terms-conditions {
        font-size: 14px;
        line-height: 1.6;
      }
      .terms-conditions h3 {
        font-size: 16px;
        color: #333;
        margin-bottom: 10px;
      }
      .terms-conditions ul {
        list-style-type: none;
        padding-left: 0;
      }
      .terms-conditions li {
        margin-bottom: 8px;
        color: #555;
      }

      .termsANDsignatory {
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
      }

      .terms-conditions {
        width: 48%;
      }

      .signatory {
        width: 48%;
        text-align: right;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      .TaxInvoiceContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
       }

      .TaxInvoice {
        text-align: center;
        font-size: 24px;
        margin-left: 80px;
        font-weight: bold;
        flex: 1;
        color: #333;
      }

      .original-copy {
        text-align: right;
         font-weight: bold;
        color: #333;
      }
    </style>
     </head>
     <body>
       <div class="main-container">
         <div class="TaxInvoiceContainer">
           <p class="TaxInvoice">Tax Invoice</p>
           <p class="original-copy">Original Copy</p>
         </div>

         <div class="invoice-container">
           <div class="header">
             <div class="left">
               <strong>GSTIN No:${companyInfo?.gstNo}</strong><br />
               <strong>PAN No:${companyInfo?.panNo}</strong>
             </div>
             <div class="center">
               <h1>${companyInfo?.companyName}</h1>
               <p>${companyInfo?.address1},${companyInfo?.city},${companyInfo?.district}</p>
             </div>
             <div class="right">
               <strong>Tel: ${companyInfo?.mobileNo}, ${companyInfo?.mobileNo2}</strong><br />
               <strong>${companyInfo?.email}</strong>
             </div>
           </div>

           <div class="party-details">
             <div class="left-column">
               <div class="strong">
                 <strong>Party Name:</strong> ${customerName || "N/A"}<br />
               </div>
               <div class="strong">
                 <strong>Address:</strong> ${customerAddress || "N/A"}<br />
               </div>
               <div class="strong">
                 <strong>GSTIN:${customerGSTNo || "N/A"}</strong><br />
               </div>
               <strong>Phone:</strong><br />
               <div class="strong">
                 <strong>GST NO:</strong> ${customerPAN || "N/A"}<br />
               </div>
               <div class="strong">
                 <strong>Delivery At:</strong> ${transportDetails.deliveryAddress || "N/A"}<br />
               </div>
             </div>
             <div class="right-column">
               <div class="box">
                 <div class="strong"><strong>INVOICE NO:</strong> ${voucherData.voucherNo}<br /></div>
                 <div class="strong"><strong>GR No.:</strong> ${transportDetails.grNo || "N/A"}<br /></div>
                 <div class="strong"><strong>GR Date:</strong> ${transportDetails.grDate || "N/A"}<br /></div>
                 <div class="strong">
                   <strong>Vehicle No.:</strong> ${transportDetails.vehicleNumber || "N/A"}<br />
                 </div>
                 <div class="strong"><strong>Transport:</strong> ${transportDetails.transporterName || "N/A"}<br /></div>
               </div>
               <div class="box">
                 <div class="strong"><strong>Date:</strong> ${formattedVoucherDate}<br /></div>
                 <div class="strong"><strong>EWay No.:</strong> ${transportDetails.ewayBillNo || "N/A"}<br /></div>
                 <div class="strong"><strong>EWay Date:</strong> ${transportDetails.ewayDate || "N/A"}<br /></div>
                 <div class="strong"><strong>State:</strong> ${transportDetails.state || "N/A"}<br /></div>
               </div>
             </div>
           </div>
            <table>
              <thead>
                <tr>
                  <th>S.N</th>
                  <th>Item Description</th>
                  <th>HSN</th>
                  <th>QTY</th>
                  <th>UOM</th>
                  <th>Rate</th>
                  <th>Discount (%) & Amt</th>
                  <th>Taxable Amt</th>
                  <th>Tax</th>
                  <th>IGST</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items?.map((item: any, index: number) => {
                  return `
                    <tr key="${item.itemId}">
                      <td>${index + 1}</td>  
                      <td>${item.itemDescription || "N/A"}</td>
                      <td>${item.hsnCode || "N/A"}</td>
                      <td>${item.mainQty || 0}</td> 
                      <td>${item.uom || "N/A"}</td>
                      <td>${item.pricePer || 0}</td> 
                      <td>${item.discountPercentage || 0}% / ${item.discountAmount || 0}</td> 
                      <td>${item.basicAmount || 0}</td> 
                      <td>${item.sgst || 0}</td>
                      <td>${item.igst || 0}</td> 
                      <td>${item.netAmount || 0}</td> 
                    </tr>
                  `;
                }).join("")}
                  <tr>
                    <td colspan="7" style="text-align: right; font-weight: bold">
                      Total:
                    </td>
                    <td>${items.reduce((sum: number, item: any) => sum + (item.basicAmount || 0), 0)?.toFixed(2)}</td>
                    <td>${items.reduce((sum: number, item: any) => sum + (item.sgst || 0), 0)?.toFixed(2)}</td>
                    <td>${items.reduce((sum: number, item: any) => sum + (item.igst || 0), 0)?.toFixed(2)}</td>
                    <td>${items.reduce((sum: number, item: any) => sum + (item.netAmount || 0), 0)?.toFixed(2)}</td>
                  </tr>
              </tbody>
            </table>
           <div class="summary-section">
             <div class="left">
               <table>
                 <th>Class</th>
                 <th>Taxable Amt.</th>
                 <th>@IGST</th>
                 <th>Total Amt.</th>

                 <tr>
                   <td>0.00%</td>
                   <td>${totalAmountBeforeTax.toFixed(2)}</td>
                   <td>0.00</td>
                   <td>${totalAmountBeforeTax.toFixed(2)}</td>
                 </tr>
                 <tr>
                   <td>5.00%</td>
                   <td>${totalGST.toFixed(2)}</td>
                   <td>${totalGST.toFixed(2)}</td>
                   <td>${(totalAmountBeforeTax + totalGST).toFixed(2)}</td>
                 </tr>
               </table>
             </div>

             <div class="right">
               <table>
                 <tr>
                   <td>Total Amount Before Tax:</td>
                   <td>${totalAmountBeforeTax.toFixed(2)}</td>
                 </tr>
                 <tr>
                   <td>Less: Discount Amount:</td>
                   <td>0.00</td>
                 </tr>
                 <tr>
                   <td>Add: IGST:</td>
                   <td>${totalGST.toFixed(2)}</td>
                 </tr>
                 <tr>
                   <td>Total Tax Amount (GST):</td>
                   <td>${totalGST.toFixed(2)}</td>
                 </tr>
               </table>
             </div>
           </div>

           <div class="bill-amount"><strong>Bill Amount:</strong> ${totalAmount.toFixed(2)}</div>

           <div class="termsANDsignatory">
             <div class="terms-conditions">
               <h3>Terms & Conditions:</h3>
               <ul>
                 <li>1. We are not responsible for loss and damage caused by transport in transit.</li>
                 <li>2. Interest @ 18% will be charged if payment is not made within 7 days.</li>
                 <li>3. Goods once sold will not be taken back.</li>
                 <li>4. I am liable to pay tax on the above and authorized to sign this invoice.</li>
               </ul>
             </div>

             <div class="signatory">
               <p>For M/S A.M. AGRO FOOD PRODUCTS</p>
               <p>Authorized Signatory</p>
             </div>
           </div>
         </div>
       </div>
     </body>
   </html>
 `;

 const handlePrint = () => {
  const printWindow = window.open("");
  printWindow?.document.write(invoiceHtml);
  printWindow?.document.close();
  printWindow?.print();
};


  return (
    <div>
      <div 
      className="d-flex justify-content-center mb-3" >
      <CustomButton
        text="Print"
        variant="success"
        onClick={handlePrint}
        size="lg" 
      />
    </div>
    <div
      dangerouslySetInnerHTML={{
        __html: invoiceHtml,
      }}
    />
    </div>
  );
}