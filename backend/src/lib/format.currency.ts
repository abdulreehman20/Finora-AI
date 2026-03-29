// Convert dollars to cents when saving
export function convertToCents(amount: number) {
	return Math.round(amount * 100);
}

// Convert cents to dollars when retrieving
//convertFromCents
export function convertToDollarUnit(amount: number) {
	return amount / 100;
}

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

export function calculateSavingRate(
	totalIncome: number,
	totalExpenses: number,
) {
	if (totalIncome <= 0) return 0;
	const savingRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
	return parseFloat(savingRate.toFixed(2));
}
