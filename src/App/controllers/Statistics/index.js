const Accounts = require("../../models/Accounts");
const Bought = require("../../models/Bought");
const BoughtAtStore = require("../../models/BoughtAtStore");
const Provider = require("../../models/Provider");
const SpecifyBill = require("../../models/SpecifyBill");
const ExportBill = require("../../models/exportBill");
const Bill = require("../../models/Bill");

const handleKey = (date) => {
    const year = new Date(date).getFullYear()
    return year
}

class Statistics{
    async overView(req,res,next){
        try {
            const users = Accounts.find({role:{$ne:'manager'},role:{$ne:'employee'}})
            const bought = Bought.find()
            const provider = Provider.find()
            const boughtAtStore = BoughtAtStore.find()
            const [userNumberPromise,boughtNumberPromise,
                providerNumberPromise,boughtAtStorePromise] = await Promise.all([users,bought,provider,boughtAtStore])
            const userNumber =  userNumberPromise.length
            const orderNumber = boughtNumberPromise.length + boughtAtStorePromise.length
            let itemNumber = boughtNumberPromise.reduce((first,item)=>first+item.number,0)
            itemNumber = boughtAtStorePromise.reduce((first,item)=>first+item.number,itemNumber)
            const providerNumber = providerNumberPromise.length
            let totalSales = boughtAtStorePromise.reduce((first,item)=>first+item.number*item.price,0)
            totalSales  = boughtNumberPromise.reduce((first,item)=>first+item.number*item.price,totalSales)
            res.status(200).json({
                totalSales,
                providerNumber,
                itemNumber,
                orderNumber,
                userNumber
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    async saleInYears(req,res,next) {
        try {
            const endDate = new Date()
            const startDate = new Date(`01/01/${endDate.getFullYear()-4}`)
            const startYear = startDate.getFullYear()
            const endYear = endDate.getFullYear()
            const bought =  Bought.find({createdAt: {$gte: startDate,$lte: endDate}})
            const boughtAtStorte = BoughtAtStore.find({createdAt: {$gte: startDate,$lte: endDate}})
            const [data,dataAtStore] = await Promise.all([bought,boughtAtStorte])
            const list = {
                [endYear]:0,
                [endYear-1]:0,
                [endYear-2]:0,
                [endYear-3]:0,
                [endYear-4]:0,
            }
            data.forEach((item,index)=>{
                const key = handleKey(item.createdAt).toString()
                if(list.hasOwnProperty(key))
                    list[key] += item.number*item.price
            })     
            dataAtStore.forEach((item,index)=>{
                const key = handleKey(item.createdAt)
                if(list.hasOwnProperty(key))
                    list[key] += item.number*item.price
            })  
            res.status(200).json({
                success: true,
                data: list
            }) 

        } catch (error) {
            console.log(error.message);
        }
    }

    async product(req,res,next) {
        try {
            const {startDate=null,endDate=new Date(),option} = req.query

            const data = await ExportBill.find({createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }}).populate('_billId')
            const newData = data.map(item=>({...item._doc,_billId:item._billId}))

            if(option*1 ===1){
                newData.sort((a,b)=>b.number - a.number)
            }
            else if(option*1 ===2){
                newData.sort((a,b)=>a.number - b.number)
            }
            else if(option*1 ===3){
                newData.sort((a,b)=>b.number*b.price - a.number*a.price)
            }

            res.status(200).json({
                title:'product is bought',
                success:true,
                data:newData
            })
        } catch (error) {
            console.log(error);
        }
    }

    async order(req, res, next) {
        try {
            const {startDate=null,endDate=new Date(),option} = req.query
            const start = new Date(startDate)
            const end = new Date(endDate)
            const dataOnline = await Bought.find({createdAt:{$gte:start,$lte:end}}).populate('idProduct userID')
            const dataAtStore = await BoughtAtStore.find({createdAt:{$gte:start,$lte:end}}).populate('idProduct')
            const data = [...dataAtStore,...dataOnline]
            if(option*1 ===1){
                data.sort((a,b)=>b.number - a.number)
            }
            else if(option*1 ===2){
                data.sort((a,b)=>a.number - b.number)
            }
            else if(option*1 ===3){
                data.sort((a,b)=>b.number*b.price - a.number*a.price)
            }
            return res.status(200).json({
                success:true,
                title:'Statistic order',
                data
            })
           
        } catch (error) {
            console.log(error.message);
        }
    }

    async user(req, res, next) {
        try {
            const {startDate=null,endDate=new Date(),option=0} = req.query
            const start = new Date(startDate)
            const end = new Date(endDate)
            let data
            if(option*1 ===1){
                data = await Bought.aggregate([
                    {
                        $group:{
                            _id:'$userID',
                            count:{$sum:1},
                            cost: { $sum: { $multiply: ['$price', '$number'] } }
                            
                        }
                    },
                    {
                        $lookup:{
                            from:'accounts',
                            localField:'_id',
                            foreignField:'_id',
                            as:'detail'
                        }
                    },
                    {
                        $sort:{
                            cost:-1
                        }
                    },
                    {
                        $match:{
                            count:{$gte:1},
                        }
                    },
                    {
                        $limit:10
                    }
                ])
                const customers = data.filter(item => {
                    return item.detail.some(detail => detail.role === 'customer');
                });
                data = customers
            }
            else{
                data =await Accounts.find({role:'customer',createdAt:{$gte:start,$lte:end}})
            }

            return res.status(200).json({
                title:'Satistic custumers',
                data:data,
                success:true
            })

        } catch (error) {
            console.log(error);
        }
    }
    async provider(req, res, next){
        try {
            const {startDate=null,endDate=new Date(),option=0} = req.query
            const start = new Date(startDate)
            const end = new Date(endDate)
            let data
            if(option*1 ===0){
                data = await Provider.find({createdAt:{$gte:start,$lte:end}})
            }
            else{
                data = await Bill.aggregate([
                    {
                        $group:{
                            _id:'$provider',
                            count:{$sum:1}
                            // quality:{$sum:'$'}
                        }
                    },
                    {
                        $lookup:{
                            from:'providers',
                            localField:'_id',
                            foreignField:'name',
                            as:'detail'
                        }
                    },
                    {
                        $sort:{
                            count:-1
                        }
                    },
                    {
                        $match:{
                            count:{$gt:0}
                        }
                    },
                    {
                        $limit:10
                    }
                ])
            }
            return res.status(200).json({
                title:'Statistic provider',
                success:true,
                data
            })
        } catch (error) {
            console.log(error.message);
        }
    } 
}

module.exports = new Statistics();