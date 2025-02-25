const Constants = require("../model/Constants");


class SolarController {
    static calculate = async (req, res) => {
        var ret = {
            status: false
        }

        try {
            console.log('[Commencing] calculate')
            if(req.method !== 'POST') {
                throw new Error('Invalid HTTP method.');
            }
            const { bill } = req.body;
            if(bill == null) {
                throw new Error('Something went wrong.');
            }

            const tnb_tariff = await Constants.findOne({
                where: {
                    constant: 'tnb_tariff',
                    active: 1
                }
            });
            if(!tnb_tariff) {
                throw new Error('Something went wrong.');
            }

            const solar_panel_cost = await Constants.findOne({
                where: {
                    constant: 'solar_panel_cost',
                    active: 1
                }
            });
            if(!solar_panel_cost) {
                throw new Error('Something went wrong.');
            }

            const annual_interest = await Constants.findOne({
                where: {
                    constant: 'annual_interest',
                    active: 1
                }
            });
            if(!annual_interest) {
                throw new Error('Something went wrong.');
            }

            const monthly_energy = bill / tnb_tariff.value;
            const daily_energy = monthly_energy/30;
            const system_size = daily_energy/(3 * .8);
            const total_system_cost = system_size * solar_panel_cost.value

            const principal = total_system_cost * .7;
            // 3 months, 6 months, 12 months, 24months repayment term
            const terms_duration = [3, 6, 12, 24]; 
            const rate = annual_interest.value;
            const monthlyRate = rate / 12;
            var schedules = {};
            for(var i=0;i<terms_duration.length;i++) {
                const n = terms_duration[i];
                const PMT = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
                schedules[n] = PMT;
            }
            
            ret.status = true;
            ret.total_system_cost = total_system_cost;
            ret.schedules = schedules;
            console.log(['[Success] calculate']);
        } catch (err) {
            console.log('[Error] calculate: ', err.message);
            ret.error = err.message
        }
        res.json(ret);
    }

    // static calculateMonthlyPayment = async (req, res) => {
    //     var ret = {
    //         status: false
    //     }

    //     try {
    //         const annual_interest = await Constants.findOne({
    //             where: {
    //                 constant: 'annual_interest',
    //                 active: 1
    //             }
    //         });
    //         if(!annual_interest) {
    //             throw new Error('Something went wrong.');
    //         }

    //         const { bill, duration } = req.body;
    //         if(bill == null) {
    //             throw new Error('Something went wrong');
    //         }

    //         if(duration == null) {
    //             throw new Error('Something went wrong');
    //         }

    //         const principal = bill * .7;
    //         const rate = annual_interest.value;
    //         const monthlyRate = rate / 12;
    //         const PMT = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    //         ret.status = true;
    //         ret.data = {
    //             paymentPerTerm: PMT,
    //             targetMonthlyPayment: principal
    //         };
    //     } catch (err) {
    //         ret.error = err.message
    //     }
    //     res.json(ret);
    // }
}

module.exports = SolarController