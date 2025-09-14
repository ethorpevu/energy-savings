document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add another month entry
    document.getElementById('addMonthBtn').addEventListener('click', addMonthEntry);
    
    // Form submission
    document.getElementById('businessForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateEmissions();
    });
    
    // View recommendations button
    document.getElementById('viewRecommendationsBtn').addEventListener('click', function() {
        // Show recommendations tab
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="recommendations"]').classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById('recommendations').classList.add('active');
        
        generateRecommendations();
    });
    
    // Initialize first month with current month
    initializeFirstMonth();
});

function initializeFirstMonth() {
    const now = new Date();
    const monthSelect = document.querySelector('.month');
    const yearInput = document.querySelector('.year');
    
    // Set to current month and year
    monthSelect.value = now.getMonth() + 1; // Months are 0-indexed in JS
    yearInput.value = now.getFullYear();
}

function addMonthEntry() {
    const usageEntries = document.getElementById('usageEntries');
    const entryTemplate = `
        <div class="usage-entry">
            <div class="form-group">
                <label>Month</label>
                <select class="month" required>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="number" class="year" value="2023" min="2000" max="2030" required>
            </div>
            <div class="form-group">
                <label>kWh Used</label>
                <input type="number" class="kwh" min="0" required>
            </div>
            <div class="form-group">
                <label>Cost ($)</label>
                <input type="number" class="cost" min="0" step="0.01" required>
            </div>
        </div>
    `;
    
    usageEntries.insertAdjacentHTML('beforeend', entryTemplate);
}

function calculateEmissions() {
    // Show loading state
    document.getElementById('loadingResults').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';
    
    // Show results tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="results"]').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('results').classList.add('active');
    
    // Collect form data
    const businessName = document.getElementById('businessName').value;
    const industry = document.getElementById('industry').value;
    const zipCode = document.getElementById('location').value;
    const buildingSize = parseFloat(document.getElementById('buildingSize').value);
    
    // Collect usage data
    const usageData = [];
    const usageEntries = document.querySelectorAll('.usage-entry');
    
    usageEntries.forEach(entry => {
        const month = parseInt(entry.querySelector('.month').value);
        const year = parseInt(entry.querySelector('.year').value);
        const kwh = parseFloat(entry.querySelector('.kwh').value);
        const cost = parseFloat(entry.querySelector('.cost').value);
        
        usageData.push({
            month,
            year,
            kwh,
            cost,
            // We'll calculate emissions based on grid factors
        });
    });
    
    // Get selected equipment
    const equipment = [];
    document.querySelectorAll('input[name="equipment"]:checked').forEach(item => {
        equipment.push(item.value);
    });
    
    // Calculate emissions (in a real app, you'd use actual grid emissions factors)
    // Here we use a simplified approach with mock grid factors
    setTimeout(() => {
        const results = processData(zipCode, usageData, buildingSize, industry);
        displayResults(results);
    }, 1000); // Simulate calculation time
}

function processData(zipCode, usageData, buildingSize, industry) {
    // In a real app, you'd lookup emissions factors by zip code
    // For this demo, we'll use sample emissions factors
    const emissionsFactors = {
        // Sample US grid emissions factors in kg CO2e per kWh
        // In a real app, these would come from an API or database lookup by region
        '00000-19999': 0.75, // Higher emissions (coal-heavy regions)
        '20000-39999': 0.65,
        '40000-59999': 0.55,
        '60000-79999': 0.45,
        '80000-99999': 0.35  // Lower emissions (renewable-heavy regions)
    };
    
    // Determine emissions factor based on zip code
    let emissionsFactor = 0.5; // Default value
    for (const range in emissionsFactors) {
        const [min, max] = range.split('-');
        if (zipCode >= min && zipCode <= max) {
            emissionsFactor = emissionsFactors[range];
            break;
        }
    }
    
    // Process each month's data
    const processedData = usageData.map(entry => {
        const emissions = entry.kwh * emissionsFactor / 1000; // Convert to metric tons
        return {
            ...entry,
            emissions,
            month: getMonthName(entry.month)
        };
    });
    
    // Calculate totals and averages
    const totalEmissions = processedData.reduce((sum, entry) => sum + entry.emissions, 0);
    const monthlyAverage = totalEmissions / processedData.length;
    const annualEstimate = monthlyAverage * 12;
    const emissionsIntensity = (totalEmissions * 1000) / buildingSize; // kg CO2e per sq ft
    
    return {
        processedData,
        totalEmissions,
        monthlyAverage,
        annualEstimate,
        emissionsIntensity,
        buildingSize,
        industry
    };
}

function getMonthName(monthNum) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNum - 1];
}

function displayResults(results) {
    // Hide loading and show results
    document.getElementById('loadingResults').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    
    // Update summary values
    document.getElementById('annualEmissions').textContent = results.annualEstimate.toFixed(2);
    document.getElementById('monthlyEmissions').textContent = results.monthlyAverage.toFixed(2);
    document.getElementById('emissionsIntensity').textContent = results.emissionsIntensity.toFixed(2);
    
    // Create charts
    createEmissionsChart(results.processedData);
    createCostEmissionsChart(results.processedData);
}

function createEmissionsChart(data) {
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    
    // Sort data chronologically
    data.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(entry => `<math-inline>{entry.month} </math-inline>{entry.year}`),
            datasets: [{
                label: 'Emissions (metric tons CO₂e)',
                data: data.map(entry => entry.emissions),
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Metric Tons CO₂e'
                    }
                }
            }
        }
    });
}

function createCostEmissionsChart(data) {
    const ctx = document.getElementById('costEmissionsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cost vs Emissions',
                data: data.map(entry => ({
                    x: entry.cost,
                    y: entry.emissions
                })),
                backgroundColor: '#34a853',
                pointRadius: 8,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Cost ($)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Emissions (metric tons CO₂e)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const entry = data[context.dataIndex];
                            return `<math-inline>{entry.month} </math-inline>{entry.year}: $<math-inline>{entry.cost}, </math-inline>{entry.emissions.toFixed(2)} tons CO₂e`;
                        }
                    }
                }
            }
        }
    });
}

function generateRecommendations() {
    const recommendations = getRecommendationsForBusiness(
        document.getElementById('industry').value,
        document.querySelectorAll('input[name="equipment"]:checked')
    );
    
    const container = document.getElementById('recommendationsContainer');
    container.innerHTML = '';
    
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <h3 class="recommendation-title">${rec.title}</h3>
            <p>${rec.description}</p>
            <div class="implementation-cost">Implementation Cost: ${rec.implementationCost}</div>
            <div class="savings">
                <div class="savings-item">
                    <div class="savings-value">$${rec.annualSavings}</div>
                    <div>Annual Savings</div>
                </div>
                <div class="savings-item">
                    <div class="savings-value">${rec.co2Reduction}</div>
                    <div>CO₂e Reduction</div>
                </div>
            </div>
            <p><strong>Payback Period:</strong> ${rec.paybackPeriod}</p>
        `;
        
        container.appendChild(card);
    });
}

function getRecommendationsForBusiness(industry, selectedEquipment) {
    // In a real app, recommendations would be generated based on 
    // actual usage patterns, equipment, and industry benchmarks
    
    // This is a simplified example
    const recommendations = [
        {
            title: "LED Lighting Upgrade",
            description: "Replace all fluorescent lighting with LED alternatives to reduce energy consumption.",
            implementationCost: "<math-inline>2,000 - </math-inline>5,000",
            annualSavings: "1,200",
            co2Reduction: "4.5 tons",
            paybackPeriod: "1.7 - 4.2 years"
        },
        {
            title: "Smart Thermostat Installation",
            description: "Install programmable thermostats to optimize heating and cooling schedules.",
            implementationCost: "<math-inline>200 - </math-inline>500",
            annualSavings: "800",
            co2Reduction: "3.2 tons",
            paybackPeriod: "0.3 - 0.6 years"
        },
        {
            title: "HVAC Maintenance Program",
            description: "Implement regular HVAC maintenance to ensure peak efficiency.",
            implementationCost: "<math-inline>500 - </math-inline>1,500 annually",
            annualSavings: "1,500",
            co2Reduction: "5.8 tons",
            paybackPeriod: "0.3 - 1.0 years"
        },
        {
            title: "Office Equipment Power Management",
            description: "Configure computers and equipment to use sleep modes and power saving features.",
            implementationCost: "<math-inline>0 - </math-inline>100",
            annualSavings: "400",
            co2Reduction: "1.6 tons",
            paybackPeriod: "Immediate"
        },
        {
            title: "Energy Management System",
            description: "Install an automated energy management system to monitor and control usage.",
            implementationCost: "<math-inline>5,000 - </math-inline>15,000",
            annualSavings: "4,500",
            co2Reduction: "18 tons",
            paybackPeriod: "1.1 - 3.3 years"
        }
    ];
    
    // In a real app, we'd filter and customize these based on user input
    return recommendations;
}