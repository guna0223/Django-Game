from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def generate_invoice_pdf(order):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 50

    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, y, "PlayZoneX - Invoice")

    y -= 40
    p.setFont("Helvetica", 11)
    p.drawString(50, y, f"Invoice ID: {order.id}")
    y -= 20
    p.drawString(50, y, f"Customer: {order.user.username}")
    y -= 20
    p.drawString(50, y, f"Order Date: {order.order_date.strftime('%d-%m-%Y')}")

    y -= 30
    p.drawString(50, y, "Items:")
    y -= 20

    for item in order.order_details.all():
        p.drawString(
            60,
            y,
            f"{item.order_item.title}  x{item.quantity}  ₹{item.price}"
        )
        y -= 20

    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, f"Total Amount: ₹{order.total_amount}")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
