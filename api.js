const axios = require('axios');
const convertTime = require('convert-time');
const telegram_api = require('./telegram_api')
const dateFormat = require("dateformat")

const districts = [
    {
        "district_id": 301,
        "district_name": "Alappuzha",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 307,
        "district_name": "Ernakulam",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 306,
        "district_name": "Idukki"
    },
    {
        "district_id": 297,
        "district_name": "Kannur"
    },
    {
        "district_id": 295,
        "district_name": "Kasaragod",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 298,
        "district_name": "Kollam",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 304,
        "district_name": "Kottayam",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 305,
        "district_name": "Kozhikode",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 302,
        "district_name": "Malappuram",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 308,
        "district_name": "Palakkad",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 300,
        "district_name": "Pathanamthitta",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 296,
        "district_name": "Thiruvananthapuram",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 303,
        "district_name": "Thrissur",
        "chat_id": "@channel_name"
    },
    {
        "district_id": 299,
        "district_name": "Wayanad",
        "chat_id": "@channel_name"
    }
]

let temp_data = {}
let turns = 0

function call() {
    var d = new Date()
    var date = d.toLocaleString('en-IN', { timeZone: "Asia/Kolkata" }).split(',')[0].split(':')
    var date_day = date[0].split('/')[0] < 10 ? 0 + date[0].split('/')[0] : date[0].split('/')[0]
    var date_month = date[0].split('/')[1] < 10 ? 0 + date[0].split('/')[1] : date[0].split('/')[1]
    var date_year = date[0].split('/')[2]
    var send_date = d.toLocaleString('en-IN', { timeZone: "Asia/Kolkata" }).split(',')[0]
    
    var sendTimeInfo = d.toLocaleString('en-IN', { timeZone: "Asia/Kolkata" }).split(',')[1].split(':')

    var send_hr = sendTimeInfo[0]
    var send_min = sendTimeInfo[1]
    var send_amPm = sendTimeInfo[2].split(' ')[1]

    var send_time = `${send_hr}:${send_min} ${send_amPm}`

    var req_date = `${date_day}-${date_month}-${date_year}`


    var updation = false
    var length_check = 0

    for (let dist = 0; dist < districts.length; dist++) {
        let request_url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districts[dist].district_id}&date=${req_date}`
        axios.get(request_url)
            .then((res) => {
                let cowin_centers = res.data['centers']

                var details_json = []

                var details = ''

                for (var i = 0; i < cowin_centers.length; i++) {
                    var centers = cowin_centers[i];
                    let cowin_sessions = centers['sessions']

                    var center_details = `🏥 *${centers.name}*\n -------------------------------------------- \n_${centers.address}_, _${centers.pincode}_ \n𝑻𝒊𝒎𝒆: *${convertTime(centers.from)}* - *${convertTime(centers.to)}*`
                    var push_data_1 = { Name: centers.name, Address: centers.address, Pincode: centers.pincode, from: convertTime(centers.from), to: convertTime(centers.to) }

                    for (var j = 0; j < cowin_sessions.length; j++) {
                        var sessions = cowin_sessions[j]

                        if (sessions.available_capacity > 5) {

                            updation = true
                            length_check++

                            if (sessions.available_capacity > temp_data[sessions.session_id]+5) {
                                var date_parse = `${sessions.date.split('-')[1]}/${sessions.date.split('-')[0]}/${sessions.date.split('-')[2]}`
    
                                var sessions_details = `\n𝑷𝒓𝒊𝒄𝒆(₹): *${centers.vaccine_fees ? centers.vaccine_fees[centers.vaccine_fees.findIndex(x => x.vaccine === sessions.vaccine)].fee : 'Free'}* \n𝑽𝒂𝒄𝒄𝒊𝒏𝒆: *${sessions.vaccine}* \n𝑫𝒂𝒕𝒆: *${sessions.date}* (*${dateFormat(date_parse, "dddd")}*) \n𝑨𝒈𝒆: *${sessions.min_age_limit}*+ \n𝑺𝒍𝒐𝒕𝒔: *${sessions.available_capacity}* \n1𝒔𝒕 𝑫𝒐𝒔𝒆: *${sessions.available_capacity_dose1}*, 2𝒏𝒅 𝑫𝒐𝒔𝒆: *${sessions.available_capacity_dose2}* \n\n`
                                details += `${center_details}${sessions_details}`
                                
                                if (length_check === 10) {
                                    telegram_api.send({ Details: details, CHAT_ID: districts[dist].chat_id, Date: send_date, Time: send_time })
                                    details = ''
                                    length_check = 0
                                }
                            } else if (sessions.session_id in temp_data ? false : true) {
                                var date_parse = `${sessions.date.split('-')[1]}/${sessions.date.split('-')[0]}/${sessions.date.split('-')[2]}`
    
                                var sessions_details = `\n𝑷𝒓𝒊𝒄𝒆(₹): *${centers.vaccine_fees ? centers.vaccine_fees[centers.vaccine_fees.findIndex(x => x.vaccine === sessions.vaccine)].fee : 'Free'}* \n𝑽𝒂𝒄𝒄𝒊𝒏𝒆: *${sessions.vaccine}* \n𝑫𝒂𝒕𝒆: *${sessions.date}* (*${dateFormat(date_parse, "dddd")}*) \n𝑨𝒈𝒆: *${sessions.min_age_limit}*+ \n𝑺𝒍𝒐𝒕𝒔: *${sessions.available_capacity}* \n1𝒔𝒕 𝑫𝒐𝒔𝒆: *${sessions.available_capacity_dose1}*, 2𝒏𝒅 𝑫𝒐𝒔𝒆: *${sessions.available_capacity_dose2}* \n\n`
                                details += `${center_details}${sessions_details}`
                                
                                if (length_check === 10) {
                                    telegram_api.send({ Details: details, CHAT_ID: districts[dist].chat_id, Date: send_date, Time: send_time })
                                    details = ''
                                    length_check = 0
                                } 
                            }

                            temp_data[sessions.session_id] = sessions.available_capacity
                        }
                    }
                }
                turns++
            
                if (turns === 1080) {
                    temp_data = {}
                    turns = 0
                }

                if (updation) {

                    if (details) {
                        telegram_api.send({ Details: details, CHAT_ID: districts[dist].chat_id, Date: send_date, Time: send_time })
                    }                          
                }
            })
            .catch((err) => console.log(err))
    }
}

setInterval(() => {
    call()
}, 90000);
