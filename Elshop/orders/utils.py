from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors


def generate_invoice_pdf(order):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4

    # Colors
    primary_color = colors.HexColor("#2c3e50")
    accent_color = colors.HexColor("#e74c3c")
    border_color = colors.HexColor("#dee2e6")
    text_dark = colors.HexColor("#212529")
    text_muted = colors.HexColor("#6c757d")

    # =========================
    # HEADER
    # =========================
    p.setFillColor(colors.white)
    p.rect(0, height - 80, width, 80, fill=1, stroke=0)

    p.setFillColor(accent_color)
    p.rect(0, height - 85, width, 5, fill=1, stroke=0)

    p.setFont("Helvetica-Bold", 24)
    p.setFillColor(primary_color)
    p.drawString(50, height - 45, "PlayZoneX")

    p.setFont("Helvetica", 10)
    p.setFillColor(text_muted)
    p.drawString(50, height - 65, "Gaming Store")

    p.setFont("Helvetica-Bold", 20)
    p.setFillColor(accent_color)
    p.drawRightString(width - 50, height - 45, "INVOICE")

    p.setFont("Helvetica", 10)
    p.setFillColor(text_muted)
    p.drawRightString(width - 50, height - 65, f"#{order.id:08d}")

    # =========================
    # BILL TO & ORDER DETAILS
    # =========================
    left_y = height - 120
    right_y = height - 120
    order_details_x = width - 230

    # Bill To
    p.setFont("Helvetica-Bold", 11)
    p.setFillColor(text_dark)
    p.drawString(50, left_y, "Bill To:")

    p.setFont("Helvetica", 10)
    left_y -= 15
    p.drawString(50, left_y, order.user.username)

    if order.address:
        address_lines = [
            order.address.address_line1,
            f"{order.address.city}, {order.address.state}",
            order.address.pincode,
        ]

        for line in address_lines:
            left_y -= 14
            p.drawString(50, left_y, line)

    # Order Details (Right)
    p.setFont("Helvetica-Bold", 11)
    p.setFillColor(text_dark)
    p.drawString(order_details_x, right_y, "Order Details:")

    p.setFont("Helvetica", 10)
    p.setFillColor(text_muted)
    right_y -= 15
    p.drawString(
        order_details_x,
        right_y,
        f"Date: {order.order_date.strftime('%d %b %Y')}",
    )

    right_y -= 15
    p.drawString(order_details_x, right_y, f"Status: {order.status}")

    right_y -= 15
    p.drawString(order_details_x, right_y, "Payment: Razorpay")

    # =========================
    # ITEMS TABLE
    # =========================
    y = min(left_y, right_y) - 50

    p.setFillColor(primary_color)
    p.rect(40, y, width - 80, 25, fill=1, stroke=0)

    p.setFont("Helvetica-Bold", 11)
    p.setFillColor(colors.white)
    p.drawString(50, y + 8, "Description")
    p.drawRightString(width - 200, y + 8, "Qty")
    p.drawRightString(width - 120, y + 8, "Unit Price")
    p.drawRightString(width - 50, y + 8, "Amount")

    y -= 22
    p.setFont("Helvetica", 10)

    for i, item in enumerate(order.order_details.all()):
        item_total = item.quantity * item.price

        p.setFillColor(colors.HexColor("#f8f9fa") if i % 2 == 0 else colors.white)
        p.rect(40, y - 5, width - 80, 20, fill=1, stroke=0)

        p.setFillColor(text_dark)
        title = item.order_item.title
        if len(title) > 50:
            title = title[:47] + "..."

        p.drawString(50, y, title)
        p.drawRightString(width - 200, y, str(item.quantity))
        p.drawRightString(width - 120, y, f"₹{item.price:,.2f}")
        p.drawRightString(width - 50, y, f"₹{item_total:,.2f}")

        y -= 25

    p.setStrokeColor(border_color)
    p.line(40, y, width - 40, y)

    # =========================
    # TOTALS
    # =========================
    y -= 30
    label_x = width - 160
    value_x = width - 50

    p.setFont("Helvetica", 10)
    p.setFillColor(text_muted)
    p.drawRightString(label_x, y, "Subtotal:")
    p.drawRightString(label_x, y - 18, "Tax:")
    p.drawRightString(label_x, y - 36, "Shipping:")

    p.setFillColor(text_dark)
    p.drawRightString(value_x, y, f"₹{order.total_amount:,.2f}")
    p.drawRightString(value_x, y - 18, "₹0.00")
    p.drawRightString(value_x, y - 36, "₹0.00")

    y -= 55
    p.setStrokeColor(accent_color)
    p.setLineWidth(2)
    p.line(label_x, y, value_x, y)

    y -= 20
    p.setFont("Helvetica-Bold", 14)
    p.setFillColor(primary_color)
    p.drawString(label_x, y, "TOTAL:")

    p.setFillColor(accent_color)
    p.drawRightString(value_x, y, f"₹{order.total_amount:,.2f}")

    # =========================
    # FOOTER
    # =========================
    y -= 60
    p.setFont("Helvetica-Bold", 12)
    p.setFillColor(primary_color)
    p.drawCentredString(width / 2, y, "Thank you for your purchase!")

    y -= 16
    p.setFont("Helvetica", 9)
    p.setFillColor(text_muted)
    p.drawCentredString(width / 2, y, "For any inquiries, contact support@playzonex.com")

    y -= 14
    p.drawCentredString(
        width / 2,
        y,
        "This invoice is computer-generated and does not require a signature.",
    )

    # =========================
    # SAVE
    # =========================
    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
