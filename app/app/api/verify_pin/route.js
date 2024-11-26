import bcrypt from 'bcrypt';
export async function POST(req) {
    try {
        const { pin, pin2 } = await req.json();
      
        // Await the bcrypt.compare call
        const compare = await bcrypt.compare(pin, pin2);
        if (!compare) {
            return new Response(JSON.stringify({ message: 'Invalid PIN', success: false }), { status: 400 });
        }

        // Successful comparison
        return new Response(JSON.stringify({ message: 'Success', success: true }), { status: 200 });
    } catch (error) {
        console.error("Error while verifying PIN: ", error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

