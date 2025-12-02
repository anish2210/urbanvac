<?php
require_once __DIR__ . '/dompdf/autoload.inc.php';
use Dompdf\Dompdf;
use Dompdf\Options;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = htmlspecialchars($_POST['type']);
    $invoiceNumber = htmlspecialchars($_POST['invoice_number']);
    $issueDate = htmlspecialchars($_POST['issue_date']);
    $customerName = htmlspecialchars($_POST['customer_name']);
    $address = nl2br(htmlspecialchars($_POST['address']));
    $items = $_POST['item_name'] ?? [];
    $quantities = $_POST['item_quantity'] ?? [];
    $prices = $_POST['item_price'] ?? [];

    // Calculate totals
    $subtotal = 0;
    $itemsHtml = '';
    foreach ($items as $index => $item) {
        $name = htmlspecialchars($item);
        $quantity = intval($quantities[$index]);
        $price = floatval($prices[$index]);
        $total = $quantity * $price;
        $subtotal += $total;

        $itemsHtml .= "
            <tr>
                <td>$name</td>
                <td>$quantity</td>
                <td>\$" . number_format($price, 2) . "</td>
                <td>\$" . number_format($total, 2) . "</td>
            </tr>
        ";
    }

    $gst = (strtolower($type) === 'invoice') ? $subtotal * 0.10 : 0;
    $total = $subtotal + $gst;

$file = 'data/invoice_data.txt';

// Get form data
$invoiceData = [
    "type" => $_POST['type'],
    "invoice_number" => $_POST['invoice_number'],
    "issue_date" => $_POST['issue_date'],
    "customer_name" => $_POST['customer_name'],
    "address" => $_POST['address'],
    "items" => $_POST['items'],
    "subtotal" => $_POST['subtotal'],
    "gst" => $_POST['gst'],
    "total" => $_POST['total']
];

// Convert to JSON and save
file_put_contents($file, json_encode($invoiceData) . PHP_EOL, FILE_APPEND | LOCK_EX);

    // Generate HTML for the PDF
    $html = "
    <html>
    <head>
    <style>
    @page {
        margin: 0;
    }

    body {
                font-family: 'Arial', sans-serif;
                margin: 15mm;
            }

    header, footer {
        position: fixed;
        left: 0;
        right: 0;
        width: 100%;
        text-align: center;
    }

    header {
        top: 0;
        height: 60px;
        padding-top: 5px;
    }

    footer {
        bottom: 0;
        height: 90px;
        padding-bottom: 30px;
    }

    .content {
        margin-top: 100px;
        margin-bottom: 90px;
    }

    .flex-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 12px;
        margin-bottom: 10px;
    }

    .flex-container .left, .flex-container .right {
        width: 48%;
    }

    h2 {
        text-align: center;
        font-size: 20px;
        margin-top: 10px;
        margin-bottom: 10px;
        color: #333;
    }

    h3 {
        font-size: 16px;
        margin-top: 15px;
        margin-bottom: 8px;
        color: #555;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: 5px;
    }

    th, td {
        border: 1px solid #ccc;
        padding: 4px;
        text-align: center;
        font-size: 12px;
    }

    th {
        background-color: #f1f1f1;
        font-weight: bold;
    }

    .summary {
        text-align: right;
        font-size: 14px;
        margin-top: 15px;
    }

    .centre-align {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        font-weight: bold;
        color: #333;
    }

    p {
        line-height: 1.4;
        margin: 3px 0;
    }

    strong {
        font-weight: bold;
    }

    .left-align p, .right-align p {
        margin: 0;
    }

    .left-align p strong, .right-align p strong {
        font-size: 14px;
    }

    .summary p {
        margin-top: 5px;
    }

    .right-align {
        text-align: right;
        margin-left: auto;
    }

    table tr {
        page-break-inside: avoid;
    }

    @media print {
        body {
            font-size: 10px;
        }

        header, footer {
            text-align: left;
            padding: 0;
        }

        .content {
            margin-top: 80px;
            margin-bottom: 80px;
        }

        table th, table td {
            font-size: 10px;
            padding: 3px;
        }
    }
</style>

    </head>
    <body>
        <header>
            <img src='https://www.urbanvac.com.au/wp-content/uploads/2025/02/header.png' alt='Page header' style='width:100%; height:auto;'>
               
        </header>
        
        <footer>
            <img src='https://www.urbanvac.com.au/wp-content/uploads/2025/02/footer.png' alt='Page footer' style='width:100%; height:auto;'>
        </footer>
        
        <div class='content'>
         
            <!-- To and From Section -->
            <div class='flex-container'>
            <br>
              <br>

        <div class='centre-align'>
        <h2>" . strtoupper($type ?: 'Invoice') . "</h2>
        </div>
        <br>
                <div class='left-align'>
                    <p><strong>To</strong><br>
                    $customerName<br>
                    $address</p>
                </div>

                <div class='right-align'>
                    <p><strong>From</strong><br>
                    Urbanvac Roof and Gutter Pty Ltd.<br>
                    19 Colchester Ave<br>
                    Cranbourne West 3977</p>
                </div>
            </div>

            <!-- Bank Details and Invoice Details Section -->
            <div class='flex-container'>
                <div class='left-align'>
                    <p><strong>Bank Details</strong><br>
                    Commbank BSB: 063 250<br>
                    A/C Name: Singh<br>
                    A/C: 1099 4913</p>
                </div>
                <div class='right-align'>
                    <p><strong>Bill No:</strong> $invoiceNumber</p>
                    <p><strong>Bill Date:</strong> $issueDate</p>
                </div>
            </div>
            
            <h3>Items</h3>
            <table>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                $itemsHtml
            </table>
            
            <div class='summary'>
                <p>Subtotal: \$" . number_format($subtotal, 2) . "</p>";
                
    if (strtolower($type) === 'invoice') {
        $html .= "<p>GST (10%): \$" . number_format($gst, 2) . "</p>";
    }
    
    $html .= "<p>Total: \$" . number_format($total, 2) . "</p>
            </div>
            
            <div class='centre-align'>
                Thank you for your business!
            </div>
        </div>
    </body>
    </html>
    ";

    // Create and configure Dompdf
    $options = new Options();
    $options->set('isRemoteEnabled', true);
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

   $pdfOutput = $dompdf->output();
file_put_contents(__DIR__ . "/invoices/Invoice_$invoiceNumber.pdf", $pdfOutput);

header("Location: invoices/Invoice_$invoiceNumber.pdf");
exit;

}
?>