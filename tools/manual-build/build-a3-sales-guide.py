"""Build the A3 English digital guide using the approved specifications.

Operating/safety instructions follow sources/a3-manual-sheet.pdf. This does not
modify the supplier original or any test certificate. Run with ReportLab installed.
"""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'assets/suntneew-a3-operating-guide-v20.pdf'
pdfmetrics.registerFont(TTFont('A3Sans','/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('A3SansBold','/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('A3Sans', normal='A3Sans', bold='A3SansBold')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='A3Body', fontName='A3Sans', fontSize=10, leading=15, spaceAfter=9, textColor=colors.HexColor('#3c4845')))
styles.add(ParagraphStyle(name='A3Title', fontName='A3SansBold', fontSize=27, leading=31, spaceAfter=18, textColor=colors.HexColor('#15221c')))
styles.add(ParagraphStyle(name='A3Heading', fontName='A3SansBold', fontSize=14, leading=19, spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#a54a18')))
styles.add(ParagraphStyle(name='A3Small', fontName='A3Sans', fontSize=8, leading=12, textColor=colors.HexColor('#61706a'), spaceAfter=7))
story=[]
def para(text, style='A3Body'): story.append(Paragraph(text, styles[style]))
def heading(text): para(text,'A3Heading')
def row_table(rows):
    data=[[Paragraph(str(c),styles['A3Body']) for c in r] for r in rows]
    table=Table(data,colWidths=[205,290],hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#f1f4f0')),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#dce2dd')),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
    story.append(table)

para('SuntNeew A3','A3Title')
para('CY-A3 | English digital operating guide | Revision: October 8, 2026','A3Small')
para('Read this guide before use. Use A3 only with a compatible 12V vehicle battery and follow your vehicle manufacturer\'s instructions. This digital guide uses the current A3 specifications; older printed guides may show earlier current ratings. The supplier original and test reports remain unchanged.')
heading('Current specifications')
row_table([
 ('Vehicle system / engine reference','12V; up to 8.0L Gas / 5.5L Diesel'),
 ('Starting / peak current','800A Starting / 2500A Peak'),
 ('Capacity / energy','16,000mAh / 59.2Wh'),
 ('USB-C','PD60W input and output'),
 ('Emergency light','150 lm; steady, strobe and SOS'),
 ('Discharge temperature','-20 C to 60 C'),
 ('Dimensions / net weight','21 x 9 x 3.5 cm; 0.77 kg'),
 ('Starts per full charge','50+ starts is the stated capability. Results vary with engine size, battery health, temperature, remaining charge and connection setup.'),
])
para('Peak current is the brief maximum output; starting current is the rated starting current. Engine size is a compatibility reference and does not guarantee a successful start.','A3Small')
heading('In the case')
para('A3 jump starter, intelligent jumper clamps, PD60W USB-C cable, EVA carry case and user manual.')
story.append(PageBreak())

para('Before the first start','A3Title')
para('Charge A3 to at least 50%. Check that the vehicle uses a compatible 12V battery. Identify the positive (+) and negative (-) terminals. Do not use a damaged battery or bypass the smart-clamp protections.')
heading('Jump-start a compatible 12V vehicle')
for text in [
 '1. Fully insert the intelligent clamp connector into the A3 jump-start socket.',
 '2. Connect the red clamp to the positive (+) battery terminal and the black clamp to the negative (-) terminal.',
 '3. Confirm the clamp\'s normal green indication before starting. If it shows a warning, stop and check the connection against the supplied instructions.',
 '4. Start the vehicle. If it starts, remove the clamps within 30 seconds and follow the supplied instructions for disconnection.',
 '5. Leave the vehicle engine running after disconnection.',
]:para(text)
heading('If the vehicle still will not start')
para('Wait at least one minute between attempts. Stop after three unsuccessful attempts and disconnect according to the supplied instructions. Repeated cranking can damage A3. The vehicle battery or another fault may need attention.')
heading('Charging A3 and other devices')
para('Recharge A3 through its USB-C input using a compatible USB-C PD cable and charger. Its USB-C port supports PD60W input and output. Check the connected device\'s requirements before use; USB-A device-charging outputs are also available. Do not exceed the marked output ratings or use A3 while it is charging.')
heading('Emergency light')
para('Turn A3 on and use the light button to select steady, strobe or SOS. Use strobe or SOS only to signal your position in a roadside emergency.')
story.append(PageBreak())

para('Care and safety','A3Title')
for text in [
 'Keep A3 away from children. It is not a toy.',
 'Do not drop A3 or subject it to strong impacts. Keep it away from water, rain and moisture.',
 'Do not put A3 in an appliance, disassemble it, attempt repairs yourself or modify it.',
 'Keep it away from flammable liquids, gases and dust. Keep all cables and clamps clear of moving engine parts.',
 'Do not expose A3 to temperatures above 70 C. Do not charge it below 0 C or above 60 C. For cold conditions, allow the unit to reach a suitable temperature before use or charging.',
 'Do not store A3 or its accessories in enclosed spaces exposed to high temperatures, such as a vehicle under direct sunlight.',
 'Recharge at least once every three months during storage. Check the remaining charge before travel and before each start attempt.',
 'Clean with a dry cloth. Do not use abrasive cleaners, gasoline or alcohol.',
 'When it reaches the end of its useful life, follow local battery and electronics recycling rules. Do not dispose of it in household waste.',
]:para('• '+text)
heading('Need help?')
para('Email <b>info@suntneew.com</b> with your order number (if available), vehicle details, A3 battery percentage and a clear photo of the clamp indication. For an order issue, include clear photos and a short description.')
para('For delivery, returns and payment conditions, visit <b>suntneew.com</b>. This operating guide is not a warranty, test report or certification. Product test documents are available separately on the A3 product page.','A3Small')

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#dde3dd'));canvas.line(48,43,A4[0]-48,43)
    canvas.setFont('A3Sans',8);canvas.setFillColor(colors.HexColor('#61706a'))
    canvas.drawString(48,29,'SuntNeew | CY-A3 | Digital operating guide')
    canvas.drawRightString(A4[0]-48,29,str(doc.page))

SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=42,bottomMargin=58,title='SuntNeew A3 / CY-A3 operating guide',author='SuntNeew').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
