
exports.handler = async (event, context) => {
    let ret = {
        status: false
    };

    try {
        console.log('[Commencing] calculate');
        if (event.httpMethod !== 'POST') {
            throw new Error('Invalid HTTP method.');
        }

        const { bill } = JSON.parse(event.body);
        if (!bill) {
            throw new Error('Something went wrong.');
        }

        // const tnb_tariff = await Constants.findOne({
        //     where: {
        //         constant: 'tnb_tariff',
        //         active: 1
        //     }
        // });
        // if (!tnb_tariff) {
        //     throw new Error('Something went wrong.');
        // }

        // const solar_panel_cost = await Constants.findOne({
        //     where: {
        //         constant: 'solar_panel_cost',
        //         active: 1
        //     }
        // });
        // if (!solar_panel_cost) {
        //     throw new Error('Something went wrong.');
        // }

        // const annual_interest = await Constants.findOne({
        //     where: {
        //         constant: 'annual_interest',
        //         active: 1
        //     }
        // });
        // if (!annual_interest) {
        //     throw new Error('Something went wrong.');
        // }

        // const monthly_energy = bill / tnb_tariff.value;
        const monthly_energy = bill / 0.509;
        const daily_energy = monthly_energy / 30;
        const system_size = daily_energy / (3 * .8);
        // const total_system_cost = system_size * solar_panel_cost.value;
        const total_system_cost = system_size * 3000;

        const principal = total_system_cost * .7;
        const terms_duration = [3, 6, 12, 24]; 
        // const rate = annual_interest.value;
        const rate = 0.05;
        const monthlyRate = rate / 12;
        let schedules = {};

        for (let i = 0; i < terms_duration.length; i++) {
            const n = terms_duration[i];
            const PMT = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
            schedules[n] = PMT;
        }

        ret.status = true;
        ret.total_system_cost = total_system_cost;
        ret.schedules = schedules;
        console.log('[Success] calculate');
    } catch (err) {
        console.log('[Error] calculate: ', err.message);
        ret.error = err.message;
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        body: JSON.stringify(ret)
    };
};
