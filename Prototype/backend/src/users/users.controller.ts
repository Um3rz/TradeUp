import { Body, Controller, Put, Request, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Mask userId in logs
    console.log('JWT User object:', { ...req.user, userId: req.user.userId ? '***' + String(req.user.userId).slice(-2) : undefined });

    const userId = req.user.userId;
    if (!userId) {
      throw new UnauthorizedException('No user ID found in token');
    }

    const user = await this.usersService.findById(userId);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user profile with sensitive fields removed
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }

  // Temporary test endpoint (remove this later)
  @Get('test')
  async test() {
    return { message: 'Users controller is working!' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('email')
  async changeEmail(@Request() req, @Body() body: { newEmail: string; currentPassword: string }) {
    const userId = req.user.userId;
    const { newEmail, currentPassword } = body;

    // Mask newEmail in logs
    console.log('Email update requested for userId:', userId ? '***' + String(userId).slice(-2) : undefined, 'newEmail:', newEmail ? newEmail[0] + '***' + newEmail.slice(newEmail.indexOf('@')) : undefined);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const emailExists = await this.usersService.emailExists(newEmail, userId);
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    await this.usersService.updateEmail(userId, newEmail);
    return {
      success: true,
      message: 'Email updated successfully'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = body;

    // Mask userId in logs
    console.log('Password update requested for userId:', userId ? '***' + String(userId).slice(-2) : undefined);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.usersService.updatePassword(userId, newPasswordHash);
    return {
      success: true,
      message: 'Password updated successfully'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('name')
  async changeName(@Request() req, @Body() body: { newName: string; currentPassword: string }) {
    const userId = req.user.userId;
    const { newName, currentPassword } = body;

    // Mask userId and newName in logs
    console.log('Name update requested for userId:', userId ? '***' + String(userId).slice(-2) : undefined, 'newName:', newName ? newName[0] + '***' : undefined);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updateName(userId, newName);
    return {
      success: true,
      message: 'Name updated successfully'
    };
  }
}