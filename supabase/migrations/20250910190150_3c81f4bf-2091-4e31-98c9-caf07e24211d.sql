-- Update short articles with comprehensive content following the enhanced format

-- 1. Ongoing costs article
UPDATE qa_articles 
SET content = '<div class="short-answer mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
  <p class="text-lg font-medium text-foreground">Property ownership in Costa del Sol involves ongoing costs including community fees (€50-400/month), IBI tax (0.4-1.1% annually), utilities, insurance, and maintenance. Budget 2-4% of property value annually for total ownership costs.</p>
</div>

<div class="detailed-content">
  <h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Complete Guide to Costa del Sol Property Ownership Costs</h2>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Beyond the initial purchase price, owning property in Costa del Sol involves several recurring costs that foreign buyers must factor into their long-term budget. Understanding these expenses is crucial for making informed investment decisions and ensuring sustainable property ownership in Spain.</p>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Annual Tax Obligations</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">The Impuesto sobre Bienes Inmuebles (IBI) is the annual property tax in Spain, calculated as a percentage of the cadastral value. In Costa del Sol municipalities, IBI rates typically range from 0.4% to 1.1% annually. For example, a €400,000 property in Marbella might incur €2,000-€4,400 in annual IBI tax.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>IBI Property Tax:</strong> 0.4-1.1% of cadastral value annually, varies by municipality</li>
    <li class="ml-4"><strong>Non-Resident Income Tax:</strong> 19% on imputed rental income (1.1-2% of cadastral value)</li>
    <li class="ml-4"><strong>Wealth Tax:</strong> Applied to properties over €700,000 (varies by region)</li>
    <li class="ml-4"><strong>Capital Gains Tax:</strong> 19-23% on profit when selling (if non-resident)</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Community Fees and Building Maintenance</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Community fees (cuotas de comunidad) are monthly charges for shared building maintenance, insurance, and services. These vary significantly based on property type and amenities. Luxury developments with pools, gyms, and concierge services command higher fees.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Basic apartment buildings:</strong> €50-150/month</li>
    <li class="ml-4"><strong>Developments with pools:</strong> €150-300/month</li>
    <li class="ml-4"><strong>Luxury resorts with amenities:</strong> €300-600/month</li>
    <li class="ml-4"><strong>Villas in gated communities:</strong> €100-400/month</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Utilities and Services</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Utility costs in Costa del Sol are generally reasonable compared to northern European countries. However, air conditioning usage during summer months can significantly increase electricity bills. Many properties use solar water heating to reduce energy costs.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Electricity:</strong> €50-150/month (higher in summer with A/C)</li>
    <li class="ml-4"><strong>Water:</strong> €30-60/month</li>
    <li class="ml-4"><strong>Internet/TV:</strong> €40-80/month</li>
    <li class="ml-4"><strong>Refuse collection:</strong> €20-40/month (municipal charge)</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Insurance and Protection</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Property insurance is essential for protecting your Costa del Sol investment. Most community buildings require individual apartment insurance, while villa owners need comprehensive coverage including building and contents insurance.</p>

  <div class="key-benefits bg-primary/10 p-6 rounded-lg mt-8">
    <h4 class="text-lg font-semibold mb-3 text-foreground">Budget Planning for Costa del Sol Property</h4>
    <p class="text-muted-foreground mb-4">As a general rule, budget 2-4% of your property value annually for all ongoing costs. This includes taxes, community fees, utilities, insurance, and maintenance reserves.</p>
  </div>
</div>'
WHERE slug = 'ongoing-costs-costa-del-sol';

-- 2. Due diligence checks article
UPDATE qa_articles 
SET content = '<div class="short-answer mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
  <p class="text-lg font-medium text-foreground">Due diligence in Spanish property purchases includes title verification, debt searches, planning permission checks, building license validation, and environmental assessments. Your lawyer conducts comprehensive checks to ensure legal compliance and protect your investment.</p>
</div>

<div class="detailed-content">
  <h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Essential Due Diligence Process for Costa del Sol Property</h2>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Due diligence is the comprehensive investigation process that verifies a property''s legal status, financial obligations, and compliance with Spanish building regulations. For foreign buyers in Costa del Sol, thorough due diligence is essential to avoid costly legal issues and ensure a secure investment.</p>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Property Title and Ownership Verification</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">The first crucial step involves verifying clear title ownership through the Spanish Land Registry (Registro de la Propiedad). Your lawyer will obtain a Nota Simple Informativa, which shows current ownership, boundaries, charges, and any restrictions on the property.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Title deed verification:</strong> Confirming seller''s legal ownership and right to sell</li>
    <li class="ml-4"><strong>Boundary checks:</strong> Ensuring property boundaries match legal descriptions</li>
    <li class="ml-4"><strong>Easements and restrictions:</strong> Identifying any rights of way or building limitations</li>
    <li class="ml-4"><strong>Inheritance issues:</strong> Verifying proper inheritance procedures if applicable</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Financial and Debt Searches</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Comprehensive debt searches ensure the property is free from outstanding mortgages, unpaid community fees, tax debts, or other financial encumbrances that could transfer to the new owner. This includes checks with tax authorities, local councils, and community administrators.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Mortgage clearance:</strong> Confirming all existing mortgages will be discharged</li>
    <li class="ml-4"><strong>Community fees:</strong> Checking for outstanding community charges</li>
    <li class="ml-4"><strong>Tax obligations:</strong> Verifying IBI and other tax payments are current</li>
    <li class="ml-4"><strong>Utility debts:</strong> Ensuring no outstanding utility bills</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Planning and Building License Validation</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Building license verification ensures the property was constructed legally and complies with local planning regulations. This is particularly important in Costa del Sol, where some historic developments may have irregularities that need addressing.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Building license (Licencia de Obra):</strong> Confirming construction was legally authorized</li>
    <li class="ml-4"><strong>First occupation license:</strong> Verifying the property can be legally occupied</li>
    <li class="ml-4"><strong>Planning compliance:</strong> Ensuring adherence to local urban planning rules</li>
    <li class="ml-4"><strong>Habitation certificate:</strong> Confirming the property meets habitability standards</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Environmental and Structural Assessments</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Environmental checks ensure the property isn''t subject to environmental restrictions or located in protected areas. Structural assessments may be recommended for older properties or those showing signs of potential issues.</p>

  <div class="key-benefits bg-primary/10 p-6 rounded-lg mt-8">
    <h4 class="text-lg font-semibold mb-3 text-foreground">Professional Due Diligence Timeline</h4>
    <p class="text-muted-foreground mb-4">Complete due diligence typically takes 2-4 weeks. We coordinate with trusted Spanish lawyers who specialize in foreign buyer transactions to ensure thorough investigation and timely completion.</p>
  </div>
</div>'
WHERE slug = 'due-diligence-checks-costa-del-sol';

-- 3. Private purchase contract article  
UPDATE qa_articles 
SET content = '<div class="short-answer mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
  <p class="text-lg font-medium text-foreground">The private purchase contract (Contrato Privado de Compraventa) is the binding agreement between buyer and seller that sets the purchase price, payment schedule, completion date, and all terms and conditions of the property transaction in Spain.</p>
</div>

<div class="detailed-content">
  <h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Understanding Spanish Private Purchase Contracts</h2>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">The private purchase contract is the most important legal document in a Spanish property transaction. Unlike the reservation contract, this is a fully binding agreement that legally commits both parties to complete the sale under specified terms and conditions.</p>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Key Components of the Contract</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">A comprehensive private purchase contract includes detailed property descriptions, agreed purchase price, payment schedule, completion timeline, and conditions that must be met for the sale to proceed. All terms must be clearly defined to protect both buyer and seller interests.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Property identification:</strong> Complete legal description including registry details</li>
    <li class="ml-4"><strong>Purchase price:</strong> Total amount and currency of transaction</li>
    <li class="ml-4"><strong>Payment schedule:</strong> Deposit amounts and completion payment timing</li>
    <li class="ml-4"><strong>Completion date:</strong> Specific date for notary signing and key handover</li>
    <li class="ml-4"><strong>Conditions precedent:</strong> Requirements that must be met (mortgage approval, licenses, etc.)</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Payment Structure and Deposits</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">Spanish property contracts typically require a 10% deposit upon signing the private contract, with the balance paid at completion. The contract specifies penalties for breach, usually forfeiture of deposit for buyers or double deposit return for sellers.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Initial deposit:</strong> Usually 10% of purchase price on signing</li>
    <li class="ml-4"><strong>Balance payment:</strong> Remaining 90% at notary completion</li>
    <li class="ml-4"><strong>Penalty clauses:</strong> Consequences for contract breach by either party</li>
    <li class="ml-4"><strong>Mortgage contingency:</strong> Protection if financing falls through</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Legal Protections and Conditions</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">The contract should include conditions that protect the buyer''s interests, such as satisfactory building licenses, clear title confirmation, and mortgage approval clauses. These conditions allow the buyer to withdraw without penalty if not met.</p>

  <ul class="feature-list list-disc list-inside mb-6 space-y-2 text-muted-foreground">
    <li class="ml-4"><strong>Building license verification:</strong> Condition requiring valid construction permits</li>
    <li class="ml-4"><strong>Title clearance:</strong> Confirmation of clean legal title</li>
    <li class="ml-4"><strong>Survey satisfaction:</strong> Property condition meeting buyer expectations</li>
    <li class="ml-4"><strong>Mortgage approval:</strong> Financing contingency for buyer protection</li>
  </ul>

  <h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">Timeline and Completion Process</h3>
  
  <p class="mb-4 text-muted-foreground leading-relaxed">The period between signing the private contract and completion typically ranges from 4-8 weeks, allowing time for mortgage arrangements, final legal checks, and administrative procedures. Both parties must be prepared to meet their obligations by the specified completion date.</p>

  <div class="key-benefits bg-primary/10 p-6 rounded-lg mt-8">
    <h4 class="text-lg font-semibold mb-3 text-foreground">Expert Contract Review</h4>
    <p class="text-muted-foreground mb-4">Never sign a private purchase contract without independent legal advice. Our network of English-speaking Spanish lawyers ensures all terms protect your interests and comply with Spanish property law.</p>
  </div>
</div>'
WHERE slug = 'private-purchase-contracts-costa-del-sol';