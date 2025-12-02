<?php
$file = 'data/invoice_data.txt';
$defaultInvoiceNumber = 3000; // Default if no previous invoices exist

if (file_exists($file) && filesize($file) > 0) {
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $lastInvoice = null;

    // Loop through the file in reverse to find the last valid invoice number
    for ($i = count($lines) - 1; $i >= 0; $i--) {
        $decoded = json_decode($lines[$i], true);
        if (isset($decoded['invoice_number']) && is_numeric($decoded['invoice_number'])) {
            $lastInvoice = $decoded['invoice_number'];
            break;
        }
    }

    if ($lastInvoice !== null) {
        $defaultInvoiceNumber = intval($lastInvoice) + 1;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice/Quotation/Cash Receipt Generator</title>

  <style>
    /* Reset default margins */
    body, h1, h3, p, label, input, select, textarea {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      background-color: #f4f4f4;
      color: #333;
    }
    header {
      text-align: center;
      margin-bottom: 2px;
    }
    header img {
      width: 114px;
      max-width: 100%;
      height: auto;
    }
    h1 {
      color: #333;
      margin-top: 4px;
      text-align: center;
      font-size: 17px;
      margin-bottom: 10px;
      border-radius: 23px;
      background: #dfdfdf;
      color: #000;
      max-width: 489px;
      padding: 8px;
      margin: 9px auto;
    }
    form {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 1000px;
      margin: 0 auto;
    }
    label {
      font-weight: bold;
      margin-top: 2px;
      display: block;
      color: #555;
    }
    input, select, textarea {
      width: 97%;
      padding: 6px;
      margin: 5px 0;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-size: 16px;
    }
    select {
      width: 98.4%;
    }
    textarea {
      height: 39px;
      resize: vertical;
    }
    button {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #218838;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: center;
      font-size: 16px;
    }
    th {
      background-color: #f8f8f8;
      color: #555;
    }
    .item_total {
      text-align: right;
    }
    .summary {
      text-align: right;
      margin-top: 20px;
      font-size: 16px;
    }
    .summary p {
      margin: 5px 0;
    }
    @media (max-width: 768px) {
      form {
        padding: 15px;
      }
      table, th, td {
        font-size: 14px;
        padding: 8px;
      }
      button {
        width: 100%;
      }
      header img {
        width: 150px;
      }
      h1 {
        font-size: 22px;
      }
    }
    @media (max-width: 480px) {
      h1 {
        font-size: 20px;
      }
      input, select, textarea {
        font-size: 14px;
      }
      button {
        padding: 10px;
        font-size: 14px;
      }
      .summary {
        font-size: 14px;
      }
    }
  </style>

  <script>
    function addItemRow() {
      const table = document.getElementById('itemsTable');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="text" name="item_name[]" placeholder="Item Name" required></td>
        <td><input type="number" name="item_quantity[]" min="1" step="1" value="1" required></td>
        <td><input type="number" name="item_price[]" min="0" step="0.01" value="0.00" required></td>
        <td class="item_total">$0.00</td>
        <td><button type="button" onclick="removeItemRow(this)">Remove</button></td>
      `;
      table.appendChild(row);
      updateTotals();
    }

    function removeItemRow(button) {
      const row = button.parentNode.parentNode;
      row.parentNode.removeChild(row);
      updateTotals();
    }

    function updateTotals() {
      let subtotal = 0;
      const rows = document.querySelectorAll('#itemsTable tr');

      rows.forEach(row => {
        const quantityInput = row.querySelector('input[name="item_quantity[]"]');
        const priceInput = row.querySelector('input[name="item_price[]"]');

        if (quantityInput && priceInput) {
          const quantity = parseFloat(quantityInput.value || 0);
          const price = parseFloat(priceInput.value || 0);
          const total = quantity * price;

          row.querySelector('.item_total').innerText = `$${total.toFixed(2)}`;
          subtotal += total;
        }
      });

      const selectedType = document.querySelector('select[name="type"]').value;
      let gst = 0;

      if (selectedType === 'Invoice') {
        gst = subtotal * 0.1; // GST is 10% of subtotal for invoices only
      }

      const total = subtotal + gst;

      document.getElementById('subtotal').innerText = `$${subtotal.toFixed(2)}`;
      document.getElementById('gst').innerText = `$${gst.toFixed(2)}`;
      document.getElementById('total').innerText = `$${total.toFixed(2)}`;
    }

    document.addEventListener('input', updateTotals);
    document.addEventListener('DOMContentLoaded', updateTotals);
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelector('select[name="type"]').addEventListener('change', updateTotals);
    });
  </script>
</head>

<body>
  <header>
    <img src="https://www.urbanvac.com.au/wp-content/uploads/2024/10/Urban-Vac-Logo.png" alt="Urban Vac Logo" />
  </header>

  <h1>Invoice/Quotation/Cash Receipt Generator</h1>

<form method="POST" action="https://tapvera.com.au/development/urbanvac_invoice/invoice_generator.php">
    <label>Type:</label>
    <select name="type" required>
      <option value="Invoice">Invoice</option>
      <option value="Quotation">Quotation</option>
      <option value="Cash Receipt">Cash Receipt</option>
    </select>

    <label>Invoice/Receipt Number:</label>
    <input type="text" name="invoice_number" value="<?php echo $defaultInvoiceNumber; ?>" readonly required />

    <label>Issue Date:</label>
    <input type="date" name="issue_date" required />

    <label>Due Date:</label>
    <input type="date" name="due_date" required />

    <label>Customer Name:</label>
    <input type="text" name="customer_name" required />

    <label>Email:</label>
    <input type="email" name="email" required />

    <label>Phone:</label>
    <input type="text" name="phone" required />

    <label>Address:</label>
    <textarea name="address" required></textarea>

    <h3>Items</h3>
    <table id="itemsTable">
      <tr>
        <th>Item Name</th>
        <th>Quantity</th>
        <th>Price (ex. GST)</th>
        <th>Total (ex. GST)</th>
        <th>Action</th>
      </tr>
    </table>
    <button type="button" onclick="addItemRow()">Add Item</button>

    <div class="summary">
      <p>Subtotal: <span id="subtotal">$0.00</span></p>
      <p>GST (10%): <span id="gst">$0.00</span></p>
      <p>Total (incl. GST): <span id="total">$0.00</span></p>
    </div>

    <button type="submit">Generate PDF</button>
  </form>
</body>
</html>
