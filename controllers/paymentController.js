const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Product = require("../models/Product");

// --- 1. INITIATE PAYMENT INTENT ---
exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, shippingAddress, email } = req.body;

    // Calculate total on server-side to prevent price tampering
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        total += product.price * 100; // Stripe expects amounts in cents
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      metadata: { 
        email,
        // Store address in metadata as a backup
        street: shippingAddress.street,
        city: shippingAddress.city,
        country: shippingAddress.country
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. STRIPE WEBHOOK (VALIDATE & CREATE ORDER) ---
// This is the most secure way to create an order
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the successful payment event
  if (event.type === "payment_intent.succeeded") {
    const session = event.data.object;

    // 1. Extract info from metadata
    const { email, street, city, country } = session.metadata;
    
    // 2. Map items (You might pass item IDs through metadata or a custom DB lookup)
    // For this example, we assume you've structured your checkout to handle this
    
    const newOrder = new Order({
      userEmail: email,
      stripePaymentIntentId: session.id,
      totalAmount: session.amount / 100,
      shippingAddress: { street, city, country },
      paymentStatus: "paid",
      status: "preparing" // Default status as requested
    });

    await newOrder.save();
    console.log(`[STRIPE] Order created for ${email}`);
  }

  res.json({ received: true });
};