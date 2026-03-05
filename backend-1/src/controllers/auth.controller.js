import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.config.js';
import { generateToken } from '../utils/generateToken.js';

async function register(req, res)
{
	const { name, email, password } = req.body;
	
	const userExists = await prisma.user.findUnique({
		where: { email: email }
	});
	
	if (userExists)
	{
		res.status(400).json({ status: 400, message: 'User already exists with this email' });
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	
	const user = await prisma.user.create({
		data: {
			name: name,
			email: email,
			password: hashedPassword
		}
	});

	const token = generateToken(user.id, res);

	res.status(201).json({
		status: 201,
		message: 'success',
		data: {
			user: {
				id: user.id,
				name: name,
				email: email
			},
			token
		}
	});
}

async function login(req, res)
{
	const { email, password } = req.body;

	const user = await prisma.user.findUnique({
		where: { email: email },
	});
	
	if (!user)
	{
		return res.status(401).json({ status: 401, message: "Invalid email or password" });
	}
	const isPasswordValid = await bcrypt.compare(password, user.password);
	
	if (!isPasswordValid)
	{
		return res.status(401).json({ status: 401, message: "Invalid email or password" });
	}
	
	const token = generateToken(user.id, res);
	
	res.status(201).json({
		status: 201,
		message: 'success',
		data: {
			user: {
				id: user.id,
				email: email
			},
			token
		},
	});
}

async function logout(req, res)
{
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0)
	});

	res.status(200).json({
		status: 200,
		message: "Logged out successfully"
	});
}

export { register, login, logout };
