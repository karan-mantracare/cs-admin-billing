/**
 * Utility functions for calculating Tax, Withholding Tax, Deductions, and Adjustments
 * based on Accounts Receivable business rules:
 * 
 * 1. Adjustment: Calculate % impact on Amount Due.
 *    Example: Amount Due = 400, Adjustment = 10% -> Impact = +40
 * 
 * 2. Deduction: Calculate % impact on (Amount Due + Adjustment Amount).
 *    Example: Amount Due + Adjustment Amount = 400 + 20 = 420, Deduction = 10% -> Impact = -42
 * 
 * 3. Tax: If Including Tax is NOT checked, calculate tax % impact on (Amount Due + Adjustment Amount).
 *    Example: Amount Due + Adjustment Amount = 400, Tax = 10% -> Impact = +40
 *    If Including Tax IS checked, tax is already included in Invoice Value (additional impact = 0).
 * 
 * 4. Withholding Tax (WHT): Deducted by client on payment.
 *    Calculate % impact on (Amount Due + Adjustment Amount).
 */

export function calculateTaxAdjustments(baseAmount = 0, taxAdjustments = [], isTaxIncluded = false) {
  const base = Number(baseAmount) || 0;

  if (!Array.isArray(taxAdjustments) || taxAdjustments.length === 0) {
    return {
      baseAmount: base,
      totalAdjustments: 0,
      totalDeductions: 0,
      totalTax: 0,
      totalWht: 0,
      basePlusAdjustments: base,
      finalAmountDue: base,
      netReceivableAfterWht: base,
      calculatedItems: []
    };
  }

  // 1. Calculate Adjustments on Base Amount Due
  // "Adjustment Calculate the % impact on the Amount Due. For ex Amount Due is 400 and Adjustment % is 10% then impact is 40"
  let totalAdjustments = 0;
  const adjItems = [];

  taxAdjustments.forEach((item, idx) => {
    const t = String(item.type || '').trim().toLowerCase();
    if (t.includes('adjust')) {
      let impact = 0;
      if (item.percentage !== undefined && item.percentage !== null && item.percentage !== '') {
        impact = (base * Number(item.percentage)) / 100;
      } else if (item.amount !== undefined && item.amount !== null && item.amount !== '') {
        impact = Number(item.amount) || 0;
      }
      totalAdjustments += impact;
      adjItems.push({
        ...item,
        originalIndex: idx,
        category: 'adjustment',
        impactAmount: impact,
        formattedImpact: `+${impact.toFixed(2)}`
      });
    }
  });

  const basePlusAdjustments = base + totalAdjustments;

  // 2. Calculate Deductions on (Base + Adjustment Amount)
  // "Deduction Calculate the % impact on the Amount Due+Adjustment Amount. For ex Amount Due+Adjustment Amount is 400+20 and Deduction % is 10% then impact is -42"
  let totalDeductions = 0;
  const deductItems = [];

  taxAdjustments.forEach((item, idx) => {
    const t = String(item.type || '').trim().toLowerCase();
    if (t.includes('deduct')) {
      let impact = 0;
      if (item.percentage !== undefined && item.percentage !== null && item.percentage !== '') {
        impact = (basePlusAdjustments * Number(item.percentage)) / 100;
      } else if (item.amount !== undefined && item.amount !== null && item.amount !== '') {
        impact = Number(item.amount) || 0;
      }
      totalDeductions += impact;
      deductItems.push({
        ...item,
        originalIndex: idx,
        category: 'deduction',
        impactAmount: -impact,
        formattedImpact: `-${impact.toFixed(2)}`
      });
    }
  });

  // 3. Calculate Tax on (Base + Adjustment Amount)
  // "If in Division Contract Including tax is not chcked then Calculate the tax % impact on the Amount Due, For ex Amount Due+Adjustment Amount is 400 and Tax % is 10% then impact is 40"
  let totalTax = 0;
  const taxItems = [];

  taxAdjustments.forEach((item, idx) => {
    const t = String(item.type || '').trim().toLowerCase();
    if ((t.includes('tax') && !t.includes('withhold') && !t.includes('wht')) || t.includes('gst') || t.includes('vat')) {
      let impact = 0;
      if (isTaxIncluded) {
        impact = 0;
      } else {
        if (item.percentage !== undefined && item.percentage !== null && item.percentage !== '') {
          impact = (basePlusAdjustments * Number(item.percentage)) / 100;
        } else if (item.amount !== undefined && item.amount !== null && item.amount !== '') {
          impact = Number(item.amount) || 0;
        }
      }
      totalTax += impact;
      taxItems.push({
        ...item,
        originalIndex: idx,
        category: 'tax',
        impactAmount: impact,
        formattedImpact: isTaxIncluded ? 'Included' : `+${impact.toFixed(2)}`
      });
    }
  });

  // 4. Calculate Withholding Tax (WHT) on (Base + Adjustment Amount)
  let totalWht = 0;
  const whtItems = [];

  taxAdjustments.forEach((item, idx) => {
    const t = String(item.type || '').trim().toLowerCase();
    if (t.includes('withhold') || t.includes('wht')) {
      let impact = 0;
      if (item.percentage !== undefined && item.percentage !== null && item.percentage !== '') {
        impact = (basePlusAdjustments * Number(item.percentage)) / 100;
      } else if (item.amount !== undefined && item.amount !== null && item.amount !== '') {
        impact = Number(item.amount) || 0;
      }
      totalWht += impact;
      whtItems.push({
        ...item,
        originalIndex: idx,
        category: 'wht',
        impactAmount: -impact,
        formattedImpact: `-${impact.toFixed(2)}`
      });
    }
  });

  // Assemble calculated items in original order
  const calculatedItems = taxAdjustments.map((item, idx) => {
    const t = String(item.type || '').trim().toLowerCase();
    if (t.includes('adjust')) {
      return adjItems.find(x => x.originalIndex === idx);
    } else if (t.includes('deduct')) {
      return deductItems.find(x => x.originalIndex === idx);
    } else if (t.includes('withhold') || t.includes('wht')) {
      return whtItems.find(x => x.originalIndex === idx);
    } else {
      return taxItems.find(x => x.originalIndex === idx);
    }
  }).filter(Boolean);

  const finalAmountDue = Math.max(0, basePlusAdjustments - totalDeductions + (isTaxIncluded ? 0 : totalTax));
  const netReceivableAfterWht = Math.max(0, finalAmountDue - totalWht);

  return {
    baseAmount: base,
    totalAdjustments,
    totalDeductions,
    totalTax,
    totalWht,
    basePlusAdjustments,
    finalAmountDue,
    netReceivableAfterWht,
    calculatedItems
  };
}
