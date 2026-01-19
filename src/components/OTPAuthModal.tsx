import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ArrowLeft, Loader2, User, Mail, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OTPAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'otp' | 'profile' | 'address' | 'account';

const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export function OTPAuthModal({ isOpen, onClose }: OTPAuthModalProps) {
  const { customer, isAuthenticated, setCustomer, setAddresses, setSessionToken, logout } = useAuthStore();
  
  const [step, setStep] = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Address fields
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && customer) {
        setStep('account');
        setName(customer.name || '');
        setEmail(customer.email || '');
      } else {
        setStep('phone');
        setPhone('');
        setOtp('');
      }
    }
  }, [isOpen, isAuthenticated, customer]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, countryCode },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('OTP sent successfully!');
        setStep('otp');
        setResendTimer(60);
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, countryCode, otp },
      });

      if (error) throw error;

      if (data?.success) {
        setCustomer(data.customer);
        setSessionToken(data.sessionToken);
        toast.success('Phone verified successfully!');
        
        // If customer has name, go to account, otherwise profile
        if (data.customer.name) {
          setStep('account');
          setName(data.customer.name);
          setEmail(data.customer.email || '');
        } else {
          setStep('profile');
        }
      } else {
        throw new Error(data?.error || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-shopify-customer', {
        body: { 
          customerId: customer?.id,
          name: name.trim(),
          email: email.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setCustomer(data.customer);
        toast.success('Profile saved!');
        setStep('address');
      } else {
        throw new Error(data?.error || 'Failed to save profile');
      }
    } catch (error: any) {
      console.error('Save profile error:', error);
      toast.error(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!address1.trim() || !city.trim() || !state || !postalCode.trim()) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-shopify-customer', {
        body: { 
          customerId: customer?.id,
          address: {
            address1: address1.trim(),
            address2: address2.trim() || undefined,
            city: city.trim(),
            province: state,
            zip: postalCode.trim(),
            country: 'India',
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        setAddresses(data.addresses || []);
        toast.success('Address saved and synced with Shopify!');
        setStep('account');
      } else {
        throw new Error(data?.error || 'Failed to save address');
      }
    } catch (error: any) {
      console.error('Save address error:', error);
      toast.error(error.message || 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setEmail('');
    setAddress1('');
    setAddress2('');
    setCity('');
    setState('');
    setPostalCode('');
    toast.success('Logged out successfully');
    onClose();
  };

  const handleBack = () => {
    switch (step) {
      case 'otp':
        setStep('phone');
        setOtp('');
        break;
      case 'profile':
        if (isAuthenticated) {
          setStep('account');
        } else {
          setStep('otp');
        }
        break;
      case 'address':
        setStep('profile');
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step !== 'phone' && step !== 'account' && (
              <button 
                onClick={handleBack}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <DialogTitle className="text-lg font-heading tracking-wide">
              {step === 'phone' && 'Login with Phone'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'profile' && 'Complete Profile'}
              {step === 'address' && 'Add Address'}
              {step === 'account' && 'My Account'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Phone Input Step */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter your phone number to receive a one-time password
                </p>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSendOTP} 
                  disabled={isLoading || phone.length < 10}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  Send OTP
                </Button>
              </motion.div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to {countryCode} {phone}
                </p>
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Verify OTP
                </Button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button 
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="text-sm text-accent hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Profile Step */}
            {step === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Complete your profile to continue
                </p>
                
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading || !name.trim()}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Address Step */}
            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 max-h-[60vh] overflow-y-auto"
              >
                <p className="text-sm text-muted-foreground">
                  Add your delivery address
                </p>
                
                <div className="space-y-2">
                  <Label>Address Line 1 *</Label>
                  <Input
                    placeholder="House/Flat No., Building Name"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input
                    placeholder="Street, Landmark"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PIN Code *</Label>
                    <Input
                      placeholder="6-digit PIN"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('account')}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                  <Button 
                    onClick={handleSaveAddress} 
                    disabled={isLoading || !address1.trim() || !city.trim() || !state || !postalCode.trim()}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-2" />
                    )}
                    Save Address
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Account Dashboard */}
            {step === 'account' && customer && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-heading text-lg">{customer.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.countryCode} {customer.phone}
                    </p>
                    {customer.email && (
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setName(customer.name || '');
                      setEmail(customer.email || '');
                      setStep('profile');
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setStep('address')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage Addresses
                  </Button>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
