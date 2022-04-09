const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll(
    {
      attributes:["id", "product_name","price","stock","category_id"],
      order:[[ 'id']],
     include: [
        {
          model:Tag,
          attributes: ["id","tag_name"],
          through:ProductTag,
          as: 'tags'
        }
      ]
    }
  )
    .then((dbData) => {
      res.json(dbData)
      console.log(dbData);
    })
    .catch((err => {
      console.log(err);
      res.status(500).json(err);
    }));

});


router.get('/:id', (req, res) => {
  // get one product
  Product.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "product_name", "price", "stock", "category_id"],
    include: [

      {
        model: Tag,
        attributes: ['id', 'tag_name'],
        through: ProductTag,
        as: "tags"
      }
    ]
  })
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No Product Found' });
        return;
      }
      res.json(dbData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
})

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(
    {
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock

    },
    {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (!product) {
        res.status(404).json({message: 'No Tag Found'});
        return;
      }
      // find all associated tags from ProductTag
     res.json(product)
    })
    .catch (err => {
      res.status(500).json(err);
    });
  
  });
//     .then((productTags) => {
//       // get list of current tag_ids
//       const productTagIds = productTags.map(({ tag_id }) => tag_id);
//       // create filtered list of new tag_ids
//       const newProductTags = req.body.tagIds
//         .filter((tag_id) => !productTagIds.includes(tag_id))
//         .map((tag_id) => {
//           return {
//             product_id: req.params.id,
//             tag_id,
//           };
//         });
//       // figure out which ones to remove
//       const productTagsToRemove = productTags
//         .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
//         .map(({ id }) => id);

//       // run both actions
//       return Promise.all([
//         ProductTag.destroy({ where: { id: productTagsToRemove } }),
//         ProductTag.bulkCreate(newProductTags),
//       ]);
//     })
//     .then((updatedProductTags) => res.json(updatedProductTags))
//     .catch((err) => {
//       // console.log(err);
//       res.status(400).json(err);
//     });
// });

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: { id: req.params.id }
  })
    .then(dbData => {
      if (!dbData) {
        res.status(404).json({ message: 'No Product Found' });
        return;
      }
      res.json(dbData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
