//import {useState } from "react";
import { useEffect } from "react";
import agent from "../../../app/api/agent";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";

interface PrintInvoicePageProps {}

export function PrintInvoicePage({}: PrintInvoicePageProps) {
  const accessId = getAccessIdOrRedirect();
  const rawVoucherId: string | null = sessionStorage.getItem("voucherId");
  const voucherId = rawVoucherId ? JSON.parse(rawVoucherId) : null;

//  const [voucherData, setVoucherData] = useState<any>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const data = await agent.SalePurchase.getVoucherById(accessId, voucherId ?? "");
        console.log("data")
        console.log(data)
        //setVoucherData(data);
      } catch (error) {
        console.error("Error fetching voucher:", error);
      }
    };

    fetchVoucher();
  }, [accessId, voucherId]);

      const invoiceHtml = `
            <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tax Invoice</title>
    <style>
      body {
        font-family: "Arial", sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 0;
      }
      .invoice-container {
        padding: 30px;
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
        align-items: center;
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
            <p><strong>GSTIN No:</strong> 03CDLPR3813C1ZU</p>
            <p><strong>PAN No:</strong> CDLPR3813C</p>
          </div>
          <div class="center">
            <h1>M/S A.M. AGRO FOOD PRODUCTS</h1>
            <p>NEW GRAIN MARKET ZIRA ZALALABAD (W), PUNJAB</p>
          </div>
          <div class="right">
            <p><strong>Email:</strong> SAM9814549070@GMAIL.COM</p>
            <p><strong>Tel:</strong> 97813-42605, 88725-42605</p>
          </div>
        </div>

        <div class="party-details">
          <div class="left-column">
            <div class="strong">
              <strong>Party Name:</strong> SOURAB ENTERPRISES<br />
            </div>
            <div class="strong">
              <strong>Address:</strong> SHOP NO 102, NEW ANAJ MANDI HANSI<br />
            </div>
            <div class="strong">
              <strong>GSTIN:</strong> 06LWGPS9621C1Z6<br />
            </div>
            <strong>Phone:</strong><br />
            <div class="strong">
              <strong>GST NO:</strong> 08AAACG2634B1Z6<br />
            </div>
            <div class="strong">
              <strong>Delivery At:</strong> GLOBUS SPIRITS LTD, VILLAGE
              SHYAMPUR, TEHSIL BEHROR, ALWAR<br />
            </div>
          </div>
          <div class="right-column">
            <div class="box">
              <div class="strong"><strong>INVOICE NO:</strong> 76<br /></div>
              <div class="strong"><strong>GR No.:</strong><br /></div>
              <div class="strong"><strong>GR Date:</strong><br /></div>
              <div class="strong">
                <strong>Vehicle No.:</strong> RJ45GA0029<br />
              </div>
              <div class="strong"><strong>Transport:</strong><br /></div>
            </div>
            <div class="box">
              <div class="strong"><strong>Date:</strong> 11-05-2023<br /></div>
              <div class="strong"><strong>EWay No.:</strong><br /></div>
              <div class="strong"><strong>EWay Date:</strong><br /></div>
              <div class="strong"><strong>State:</strong><br /></div>
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
            <tr>
              <td>1</td>
              <td>MAIZE</td>
              <td>1001</td>
              <td>1000</td>
              <td>QTL</td>
              <td>12,000</td>
              <td>5% / 3,00,000</td>
              <td>60,00,000</td>
              <td>1,14,00,000</td>
              <td>6,00,000</td>
              <td>1,23,00,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>WHEAT</td>
              <td>1002</td>
              <td>500</td>
              <td>QTL</td>
              <td>15,000</td>
              <td>10% / 1,50,000</td>
              <td>37,50,000</td>
              <td>33,75,000</td>
              <td>1,68,750</td>
              <td>36,93,750</td>
            </tr>
            <tr>
              <td>3</td>
              <td>PADDY</td>
              <td>1003</td>
              <td>800</td>
              <td>QTL</td>
              <td>10,000</td>
              <td>8% / 64,000</td>
              <td>80,00,000</td>
              <td>73,60,000</td>
              <td>3,68,000</td>
              <td>80,96,000</td>
            </tr>
            <tr>
              <td colspan="7" style="text-align: right; font-weight: bold">
                Total:
              </td>
              <td>1,77,50,000</td>
              <td>1,77,35,000</td>
              <td>7,68,750</td>
              <td>1,97,89,750</td>
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
                <td>927,903.00</td>
                <td>0.00</td>
                <td>927,903.00</td>
              </tr>
              <tr>
                <td>5.00%</td>
                <td>30,000.00</td>
                <td>1,500.00</td>
                <td>31,500.00</td>
              </tr>
            </table>
          </div>

          <div class="right">
            <table>
              <tr>
                <td>Total Amount Before Tax:</td>
                <td>957,903.00</td>
              </tr>
              <tr>
                <td>Less: Discount Amount:</td>
                <td>0.00</td>
              </tr>
              <tr>
                <td>Add: IGST:</td>
                <td>1,500.00</td>
              </tr>
              <tr>
                <td>Total Tax Amount (GST):</td>
                <td>1,500.00</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="bill-amount"><strong>Bill Amount:</strong> 959,403.00</div>

        <div class="termsANDsignatory">
          <div class="terms-conditions">
            <h3>Terms & Conditions:</h3>
            <ul>
              <li>
                1. We are not responsible for loss and damage caused by
                transport in transit.
              </li>
              <li>
                2. Interest @ 18% will be charged if payment is not made within
                7 days.
              </li>
              <li>3. Goods once sold will not be taken back.</li>
              <li>
                4. I am liable to pay tax on the above and authorized to sign
                this invoice.
              </li>
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

    return (
        <div
        dangerouslySetInnerHTML={{
            __html: invoiceHtml,
        }}
        />
    );
}