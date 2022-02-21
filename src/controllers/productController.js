const db = require('../database/models')
const { Op } = require("sequelize");
const { promiseImpl } = require('ejs');

/*Modelos base de datos*/

const Products = db.Product
const Colors = db.Color
const Brands = db.Brand
const Categories = db.Category


const productController = {
    index: (req,res)=>{

        
            let products = Products.findAll({include:['brand','color','category']},{
                where:{
                    section:'Destacado'
                },
                limit:8
            })
            let sale = Products.findAll({include:['brand','color','category'],
                where:{
                    section:'Ofertas'
                },
                limit:4
            })


            Promise
            .all([products,sale])
            .then(([products,sale]) => {
                console.log(products)
                console.log('-----------------');
                console.log(sale);
                return  res.render('products/index',{user:req.session.user,sale,products})
            })
       
       
    },
    all: (req,res)=>{
    
        
            Products.findAll({include:['brand','color','category']})
            .then(products =>
                {
                    console.log(products)
                    res.render('products/products',{user:req.session.user,products})
                
                })
                
       


            
        
            
},
    edit: (req,res)=>{

    
      

            let id=req.params.id;
            let producto=Products.findByPk(id);
            let colors = Colors.findAll();
            let categories = Categories.findAll();
            let brands = Brands.findAll();

            Promise
           .all([producto,colors,categories,brands])
           .then(([producto,colors,categories,brands])=>
            {
                res.render('products/editProduct',{user:req.session.user,producto,colors,categories,brands})
            })


           
       
       
    },
    add: (req,res)=>{

        

            let brands = Brands.findAll();
            let colors= Colors.findAll();
            let categories = Categories.findAll();

            Promise
            .all([brands,colors,categories])
            .then(
                ([brands,colors,categories]) => {
                    res.render('products/productAdd',{user:req.session.user , brands,colors,categories})
                }
            )


           
       
       

    },
    store: (req, res) => {
        let product = {
            name:req.body.name,
            price:req.body.price,
            stock_min:req.body.stock_min,
            stock_max:req.body.stock_max,
            stock:req.body.stock,
            section:req.body.section,
            categoryId:req.body.categoryId,
            colorId:req.body.colorId,
            brandId:req.body.brandId,
            description:req.body.description,
            extended_description:req.body.extended_description
        
        }
        
        if(req.file){
            product.image = req.file.filename
        }else{
            product.image = 'default-image.png'
        }

        Products.create(product)
        .then(() => {
            return  res.redirect('products')
        })

        
    },
    

    detail: function (req,res) {

       

            let sale = Products.findAll({include:['brand','color','category'],
            where:{
                section:{
                    [Op.eq]: 'Ofertas'
                }
            },
            limit:4
        })
            
           let producto =  Products.findByPk(req.params.id)


           Promise
           .all([sale,producto])
            .then(([sale,producto]) =>{
                    res.render('products/productDetail',{user:req.session.user,sale,producto})
                })

            
       
       
    },
    cart: (req,res)=>{

        
            res.render('products/productCart',{user:req.session.user})
        
    },
    // Update - Method to update
	update: (req, res) => {
		

		let idReq = req.params.id

		let  row= req.body
		row.id = idReq

			if(req.file!=undefined){
				row.image = req.file.filename
			}
			else if(req.file==undefined){
				let  product =Products.findByPk(idReq).then(result=>{
                    return result
                })
                
                    row.image = product.image
			}
			

		
		Products.update(row,{
            where:{
                id:idReq
            }
        })
        .then(()=>{

            res.redirect('/products')
        })

		
},
search:function (req,res) {
    Products.findAll({
        where:
        {
            name :{[Op.like]:'%'+ req.body.search +'%'}
        }
    })  
    .then(products =>{
        
        res.render('products/products',{user:req.session.user,products})
    })
},
		
    // Delete - Delete one product from DB
	destroy : (req, res) => {
		// Do the magic
	let productId = req.params.id;

    Products
    .destroy({where: {id:productId}, force : true})
    .then(()=>{
        res.redirect('/products')
    })

}
}


module.exports=productController;