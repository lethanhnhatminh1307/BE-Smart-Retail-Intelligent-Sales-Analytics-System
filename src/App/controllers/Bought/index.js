const BillAtStore = require('../../models/BillAtStore');
const Bought = require('../../models/Bought');
const BoughtAtStore = require('../../models/BoughtAtStore');
const Inventory = require('../../models/Inventory');
const Product = require('../../models/Product');
const exportBill = require('../../models/exportBill');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const sortMonth = (month)=>{
    const newMonth = new Date(month).getMonth() +1
    switch(newMonth){
        case 1: 
            return 'jan'
        case 2:
            return 'feb'
        case 3: 
            return 'march'
        case 4:
            return 'april'
        case 5: 
            return 'may'
        case 6:
            return 'june'
        case 7: 
            return 'july'
        case 8:
            return 'august'
        case 9: 
            return 'sep'
        case 10:
            return 'oct'
        case 11: 
            return 'nov'
        case 12:
            return 'dec'
    }
}



const checkDelivered = async(code)=>{
    const token = '74e5fe47-5d4c-11ee-b394-8ac29577e80e'
    if(code){
        const orderCode = {order_code:code}
        const reponse = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail',{
            method: "post",
            headers: {
              "Content-Type": "application/json",
              "Token":token
            },
            body: JSON.stringify(orderCode), 
        })
        const data = await reponse.json()   
        return data?.data?.status ==='delivered'
    }
    return false
}


class BoughtController {
    async myBought(req,res,next){
        const id = req.query.id;
        const data = await Bought.find({userID:id}).populate('idProduct').sort({'createdAt':-1})
        return res.status(200).json({
            title:'my bought',
            success: true,
            data
        })
    }
    
    async allBought(req, res, next) {
        const data = await Bought.find({code:null}).populate('idProduct userID','-password')
        res.status(200).json({
            title:'all bought that shop transfer',
            success:true,
            data:data
        })
    }
    
    async updateStatus(req, res){
       try {
            const id = req.body.idBought
            const status = req.body.status
            const {billId,itemId,number,price,name} = req.body
            const data = await Bought.updateOne({_id:id},{$set:{code:status}})
            if(status==='success'){
                await exportBill.updateOne({billId,itemId,price,name},{$inc:{number:number}},{upsert:true})
                await Inventory.updateOne({billId,itemId},{$inc:{number:-number}})
            }
            res.status(200).json({
                title:'updating status',
                success:true,
                data:data
            })
       } catch (error) {
            console.log(error);
       }
        
    }

    async boughtList(req, res) {
       try {
        let listMonth = {
            jan:0,
            feb:0,
            march:0,
            april:0,
            may:0,
            june:0,
            july:0,
            august:0,
            sep:0,
            oct:0,
            nov:0,
            dec:0,
        }
        let listAtStore = {...listMonth}
        const year = req.body.year || new Date().getFullYear()
        const startOfYear = new Date(year, 0, 1)
        
        const endOfYear = new Date(year*1 + 1, 0, 1);
        const data = await Bought.find({
            createdAt:{
                $gte:startOfYear,
                $lt:endOfYear
            },
        })
        const dataAtStore =  await BoughtAtStore.find({
            createdAt:{
                $gte:startOfYear,
                $lt:endOfYear
            },
        })
        let promises = []
        
        if (data.length > 0){
            promises = data.map(async (item) => {
                if(item.code  && item.code !=='error'){
                    const key = sortMonth(item.createdAt);
                    if (!listMonth[key]) {
                        listMonth[key] = 0;
                    }
                    listMonth[key] = ((listMonth[key]) + item.price*item.number)*1;
                }
                // else{
                //     // const isDelivered =  await checkDelivered(item.code);                 
                //         const key = sortMonth(item.createdAt);
                //         if (!listMonth[key]) {
                //         listMonth[key] = [];
                //         }
                //         listMonth[key] = ((listMonth[key]) + item.price*item.number)*1;
                // }
            });
            
          }
          const promiseStore = dataAtStore.map(async (item) => {
                const key = sortMonth(item.createdAt);
                if (!listAtStore[key]) {
                    listAtStore[key] = [];
                }
                listAtStore[key] = ((listAtStore[key]) + item.price*item.number)*1;
        });
        await Promise.all([...promises,...promiseStore]);
          return res.status(200).json({
            title: 'list bought',
            success: true,
            data: [listMonth,listAtStore],
          });
       } catch (error) {
            console.log(error);
       }
    }

    async boughtAtStore(req, res, next) {
        try {
            const {billId,customerName,phoneNumber,address,products,number} = req.body
            const bill = new BillAtStore({billId,name:customerName,phoneNumber,address})
            const dataBill = await bill.save()
            if(!dataBill){
                return res.status(200).json({
                    success: false,
                    // data:data,
                    
                })
            }
            const boughts = []
            for(let i = 0; i < products.length; i++) {
                const bought = new BoughtAtStore({billId:billId,nameProduct:products[i].name,
                    idProduct:products[i]._id,price:products[i].price,number:number[i],name:customerName})
                await bought.save()
                await Product.updateOne({_id:products[i]._id},{$inc:{number:-number[i]}})
                await exportBill.updateOne({billId:products[i].billId,itemId:products[i].itemId,price:products[i].price,name:products[i].name},{$inc:{number:number[i]}},{upsert:true})
                await Inventory.updateOne({billId:products[i].billId,itemId:products[i].itemId},{$inc:{number:-number[i]}})
                boughts.push(bought.save())
            }
            const data = await Promise.all(boughts)
            if(data.length){
                return res.status(200).json({
                    success: true,
                    data:data,

                })

            }
            return res.status(200).json({
                success: false,
                data:data,
                
            })
            // const newBoughtAtStore = new BoughtAtStore({idProduct,nameProduct,price,number})
            // const data = await newBoughtAtStore.save()
            // await Product.updateOne({_id:idProduct},{$inc:{number:-number}})
            // await exportBill.updateOne({billId,itemId,price,name:nameProduct},{$inc:{number:number}},{upsert:true})
            // await Inventory.updateOne({billId,itemId},{$inc:{number:-number}})
            // res.status(200).json({
            //     title:'bought at store',
            //     success:true,
            //     data
            // })
        } catch (error) {
            console.log(error);
            if(error.code === 11000){
                res.status(400).json({
                    success:false,
                    message:'Mã đơn hàng đã tồn tại'
                })
            }
        }
    }

    async getBillAtStore(req, res, next) {
        try {
            const data = await BillAtStore.find()
            res.status(200).json({
                success: true,
                data: data
            })
        } catch (error) {
            
        }
    }
    async getDetailBill(req, res) {
        try {
            const billId = req.query?.billId
            const data = await BoughtAtStore.find({billId})
            res.status(200).json({
                success: true,
                data: data
            })
        } catch (error) {
            
        }
    }
}

module.exports = new BoughtController()
