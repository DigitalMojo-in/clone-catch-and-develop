import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ChevronDown, Phone, Download, Calendar, Loader2, X, Sun, Moon } from 'lucide-react';
import luxuryBannerBg from '@/assets/luxury-banner-bg.jpg';
import digitalMojoLogo from '@/assets/digital-mojo-logo.png';
import { getCPLForLocation } from '@/data/cplData';
import EnhancedCharts from './EnhancedCharts';
import AnimatedBackground from './AnimatedBackground';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Metrics {
  leads: number;
  qualifiedLeads: number;
  siteVisits: number;
  bookings: number;
  cpl: number;
  cpql: number;
  cpsv: number;
  cpb: number;
  totalBudget: number;
}

interface UserFormData {
  name: string;
  mobile: string;
  email: string;
  organization: string;
}

const LeadCalculator = () => {
  const { toast } = useToast();
  
  const [propertyType, setPropertyType] = useState('Residential');
  const [launchType, setLaunchType] = useState('Launch');
  const [location, setLocation] = useState('Mumbai South');
  const [bhk, setBhk] = useState('2 BHK');
  const [marketingChannels, setMarketingChannels] = useState('Google');
  const [sellUnits, setSellUnits] = useState(50);
  const [duration, setDuration] = useState('6 Months');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({ name: '', mobile: '', email: '', organization: '' });
  const [resultsUnlocked, setResultsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewResultsClicked, setViewResultsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isViewResultsLoading, setIsViewResultsLoading] = useState(false);
  const [hideStickyCTA, setHideStickyCTA] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isUnlockLoading, setIsUnlockLoading] = useState(false);

  const [metrics, setMetrics] = useState<Metrics>({
    leads: 8333,
    qualifiedLeads: 1833,
    siteVisits: 500,
    bookings: 50,
    cpl: 2160,
    cpql: 9819,
    cpsv: 35999,
    cpb: 359986,
    totalBudget: 17999280
  });

  const calculateMetrics = () => {
    const actualCPL = getCPLForLocation(location, bhk);
    const baseLeads = sellUnits * 167;
    const locationMultiplier = location.includes('Mumbai') ? 1.5 : 
                             location.includes('Delhi') ? 1.3 :
                             location.includes('Bangalore') ? 1.2 : 
                             location.includes('Chennai') ? 1.0 : 
                             location.includes('Hyderabad') ? 0.9 : 0.8;
    
    const bhkMultiplier = bhk === '1 RK' ? 0.7 : 
                         bhk === '1 BHK' ? 0.8 : 
                         bhk === '2 BHK' ? 1.0 : 
                         bhk === '3 BHK' ? 1.2 : 
                         bhk === '4 BHK' ? 1.4 : 
                         bhk === '5 BHK' ? 1.6 : 
                         bhk.includes('Plot') ? 1.1 : 
                         bhk === 'Villa' ? 1.8 : 1.0;
    
    const channelMultiplier = marketingChannels.includes('Google') ? 1.3 : 
                             marketingChannels.includes('+') ? 1.1 : 1.0;
    
    const cplMult = marketingChannels.includes('+') ? 0 : 257;
    const propertyMultiplier = propertyType === 'Villa' ? 1.5 :
                              propertyType === 'Commercial' ? 1.3 :
                              propertyType === 'Senior Living' ? 0.8 : 1.0;
    
    const launchMultiplier = launchType === 'Teaser' ? 0.7 :
                            launchType === 'Launch' ? 1.0 :
                            launchType === 'Sustenance' ? 0.9 :
                            launchType === 'NRI' ? 1.2 : 1.0;
    
    let cpl = marketingChannels.includes('+')? actualCPL:
                marketingChannels.includes('Google') ? actualCPL+cplMult : actualCPL-cplMult;
    cpl=Math.round(cpl*locationMultiplier);
    if(cpl<300){
      cpl=cpl+200;
    }
    const leads = Math.round(baseLeads * locationMultiplier * bhkMultiplier * channelMultiplier * propertyMultiplier * launchMultiplier);  
    const qualifiedLeads = Math.round(leads * 0.3);
    const siteVisits = Math.round(qualifiedLeads * 0.2);
    const bookings = sellUnits;
    
    const totalBudget = leads * cpl;
    const cpql = Math.round(totalBudget/qualifiedLeads);
    
    const cpsv = Math.round(totalBudget / siteVisits);
    const cpb = Math.round(cpsv * (siteVisits / bookings));

    setMetrics({
      leads,
      qualifiedLeads,
      siteVisits,
      bookings,
      cpl,
      cpql,
      cpsv,
      cpb,
      totalBudget
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [propertyType, launchType, location, bhk, marketingChannels, sellUnits, duration]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const footer = document.querySelector('#footer');
      if (footer && window.innerWidth < 768) {
        const footerRect = footer.getBoundingClientRect();
        const isFooterVisible = footerRect.top < window.innerHeight + 100;
        setHideStickyCTA(isFooterVisible);
      } else {
        setHideStickyCTA(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlockResults = async () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.organization) return;
    
    setIsUnlockLoading(true);
    const webAppURL = "https://script.google.com/macros/s/AKfycbzvY-cPO-fsMULjOLHsC-G47tePzt7EHUt2Uchlau8K3424HW9n7LG8Y-8HB_FOLkXX/exec";
  
    try {
      const response = await fetch(webAppURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: formData.name,
          phone: formData.mobile,
          email: formData.email,
          organization: formData.organization,
        }),
      });
  
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show loading for better UX
      
      setResultsUnlocked(true);
      setShowUnlockDialog(false);
      setShowForm(false);
      setIsUnlockLoading(false);
      toast({
        title: "We will call you back soon! 😊",
        description: "Thank you for your interest. Our team will reach out to you shortly.",
      });
  
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error) {
      setIsUnlockLoading(false);
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleViewResults = async () => {
    if (!resultsUnlocked) {
      setShowUnlockDialog(true);
    }
  };

  const handleBookCall = () => {
    setShowForm(true);
  };

  // Generate time-series data for the trend chart
  const generateTimeSeriesData = () => {
    const timePoints = duration === '3 Months' ? 3 : duration === '6 Months' ? 6 : 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Array.from({ length: timePoints }, (_, i) => {
      const monthIndex = (new Date().getMonth() + i) % 12;
      const baseVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 variation
      
      return {
        month: monthNames[monthIndex],
        leads: Math.round(metrics.leads * baseVariation / timePoints),
        siteVisits: Math.round(metrics.siteVisits * baseVariation / timePoints),
        bookings: Math.round(metrics.bookings * baseVariation / timePoints),
        cpl: metrics.cpl
      };
    });
  };

  const chartData = generateTimeSeriesData();

  return (
    
    <div className={`min-h-screen px-0 transition-colors duration-300 ${isDarkMode ? 'bg-black' : ''}`} style={{ backgroundColor: isDarkMode ? '#000000' : '#f0bc00' }}>
      
      {/* Desktop Theme Toggle - Left Wall */}
      <div className="hidden sm:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="ghost"
          size="sm"
          className={`backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Theme Toggle - Bottom Left Corner */}
      <div className="sm:hidden fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="ghost"
          size="sm"
          className={`backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sticky Get In Touch - Right Wall - Updated with pill shape */}
      <div className="hidden sm:block fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={handleBookCall}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-xl transition-all duration-300 font-spartan transform -rotate-90 origin-center whitespace-nowrap"
          style={{ 
            fontSize:'25px',
            borderRadius: '50px',
            minWidth: '140px',
            height: '56px'
          }}
        >
          FREE Strategy Call
        </Button>
      </div>

      {/* Header */}
      <header className="top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out bg-transparent py-4">
  <div className="flex justify-between items-center px-4 sm:px-8 ">
    <div className="flex items-center space-x-0">
      <a href="#" className="flex items-center group">
        <img
          src="./lovable-uploads/DMM.png"
          alt="Digital Mojo Logo"
          className="w-28 h-28 sm:w-40 sm:h-40 object-contain group-hover:scale-105 transition-all duration-500 ease-in-out"
        />
      </a>
    </div>

   

    {/* Desktop CTA */}
    <div className="hidden sm:flex  justify-start pl-100"> {/* Added flex and padding-left */}
  <Button
    onClick={handleBookCall}
    className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-16 rounded-full shadow-2xl hover:shadow-red-400/30 hover:scale-110 hover:animate-bounce-once transition-all duration-300 font-spartan text-2xl"
  >
    Book Now
  </Button>
</div>


    {/* Mobile CTA */}
    <div className="block sm:hidden">
      <Button
        onClick={handleBookCall}
        className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-6 rounded-full shadow-md transition-all duration-300 font-spartan text-base"
      >
        Book Now
      </Button>
    </div>
  </div>
</header>


      {/* Hero Section */}
      <div className="w-full px-10 sm:px-20 xl:px-24 mt-1 sm:mt-4 lg:mt-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6 xl:gap-4">
          {/* Left - Text Block */}
          <div className="flex-1 mx-auto lg:mx-0 max-w-2xl">
            <div className="pt-6 pb-25 sm:pb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-black leading-tight font-spartan mb-4 transition-colors duration-300 text-white relative">
  <div className="flex items-baseline gap-2 flex-wrap">
    <span className="text-white">Know Every</span>
    <span 
      className="text-[7rem] md:text-[12rem] font-extrabold leading-none font-spartan" 
      style={{ color: isDarkMode ? '#f0bc00' : '#000000' }}
    >
      ₹
    </span>
  </div>
  <div className="text-white">
    Before You Invest 
  </div>
    <br/>
  <div className="text-white">
    Calculate Your <br/>
    <span className="text-[#000000]"
    style={{ color: isDarkMode ? '#f0bc00' : '#000000' }}>
      Ad Plan.</span>
  </div>
</h1>

              <p className={`text-lg md:text-xl leading-relaxed font-spartan transition-colors duration-300 ${isDarkMode ? 'text-white/90' : 'text-white/90'}`}>
                Data-driven insights. ROI that speaks. Let's build your growth story.
              </p>
            </div>
          </div>

          {/* Right - Image */}
          <div className="flex-[1.6] flex justify-center lg:justify-end mt-6 lg:mt-0 px-4 sm:px-6 lg:px-8 xl:px-10">
            <img
              src="./lovable-uploads/img.png"
              alt="Business Growth Calculator"
              className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-[40rem] h-auto scale-[1.2] transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Aesthetic Divider after Hero */}
      <div className="w-full px-4 sm:px-10 xl:px-24 my-8">
        <div className="flex items-center justify-center">
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
          <div className={`mx-4 text-2xl ${isDarkMode ? 'text-white/40' : 'text-white/50'}`}>✦</div>
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
        </div>
      </div>

      {/* Calculator Section - Always Light Mode */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-24 mt-12 lg:mt-20 mb-12">
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 max-w-none">
          <Card className="backdrop-blur-lg border-none shadow-xl rounded-2xl overflow-hidden bg-white/95">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-center text-gray-900">Calculate Your Leads</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <label className="text-foreground text-lg font-bold mb-3 block font-spartan">Units to Sell</label>
                <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                    onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={sellUnits}
                    onChange={(e) => setSellUnits(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-extrabold text-[5rem] rounded-lg h-20 w-32 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{fontSize: '2rem'}}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                    onClick={() => setSellUnits(sellUnits + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Form Inputs */}
              <div className="space-y-4">
                {/* Property Type */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                      <SelectValue />
                    </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                     <SelectItem value="Residential">Residential</SelectItem>
                     <SelectItem value="Commercial">Commercial</SelectItem>
                     {/* <SelectItem value="Senior Living">Senior Living</SelectItem> */}
                     <SelectItem value="Plots">Plots</SelectItem>
                     <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Launch Type */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl ">
                     <SelectItem value="Teaser">Teaser</SelectItem>
                     <SelectItem value="Launch">Launch</SelectItem>
                     <SelectItem value="Sustenance">Sustenance</SelectItem>
                     <SelectItem value="NRI">NRI</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Location */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl max-h-60">
                     <SelectItem value="Bangalore East">Bangalore East</SelectItem>
                     <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                     <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                     <SelectItem value="Bangalore West">Bangalore West</SelectItem>
                     <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                     <SelectItem value="Chennai East">Chennai East</SelectItem>
                     <SelectItem value="Chennai North">Chennai North</SelectItem>
                     <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                     <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                     <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                     <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                     <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                     <SelectItem value="Pune">Pune</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Configuration */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Configuration</label>
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                     <SelectItem value="1 RK">1 RK</SelectItem>
                     <SelectItem value="1 BHK">1 BHK</SelectItem>
                     <SelectItem value="2 BHK">2 BHK</SelectItem>
                     <SelectItem value="3 BHK">3 BHK</SelectItem>
                     <SelectItem value="4 BHK">4 BHK</SelectItem>
                     <SelectItem value="5 BHK">5 BHK</SelectItem>
                     <SelectItem value="Villa">Villa</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Marketing Channels */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                     <SelectItem value="Google">Google Ads</SelectItem>
                     <SelectItem value="Meta">Meta Ads</SelectItem>
                     <SelectItem value="G+M">Google Ads+Meta Ads</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Duration */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                    style={{fontSize: '1.5rem'}}>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl text-">
                     {/* <SelectItem value="15 Days">15 Days</SelectItem> */}
                     <SelectItem value="1 Month">1 Month</SelectItem>
                     <SelectItem value="2 Months">2 Months</SelectItem>
                     <SelectItem value="3 Months">3 Months</SelectItem>
                     <SelectItem value="4 Months">4 Months</SelectItem>
                     <SelectItem value="5 Months">5 Months</SelectItem>
                     <SelectItem value="6 Months">6 Months</SelectItem>
                     <SelectItem value="7 Months">7 Months</SelectItem>
                     <SelectItem value="8 Months">8 Months</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
              </div>

              {/* View Results Button with Loading Animation */}
              <div className="text-center mt-6 relative">
                <Button
                  onClick={handleViewResults}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {resultsUnlocked ? "Results Unlocked" : "Visualize Your Growth"}
                </Button>
              </div>

              <div className="text-xs pt-6 border-t mt-6 font-spartan text-muted-foreground border-border">
                <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Results Section - Always Light Mode */}
          <Card className="backdrop-blur-lg border-none shadow-xl rounded-2xl relative bg-white/95">
            {!resultsUnlocked && (
              <div className="absolute inset-0 z-20 blur-overlay rounded-2xl"></div>
            )}
            
            <CardContent className="p-6">
              <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
                {/* Metrics Cards - Single Row */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2 bg-white">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.leads.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Leads</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpl.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Cost Per Lead</div>
                  </Card>
                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2 bg-white">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.qualifiedLeads.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Quality Leads</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpql.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPQL</div>
                  </Card>
                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2 bg-white">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.siteVisits.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Site Visit</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpsv.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPSV</div>
                  </Card>
                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2 bg-white">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.bookings.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Bookings</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpb.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPB</div>
                  </Card>
                </div>

                {/* Total Budget */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Total Budget</h3>
                  <p className="text-5xl font-bold text-blue-600">₹{metrics.totalBudget.toLocaleString()}</p>
                </div>

                {/* Charts */}
                <EnhancedCharts 
                  metrics={metrics} 
                  chartData={chartData} 
                  duration={duration}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Call Button - Outside the boxes, center aligned - Desktop only */}
        <div className="hidden lg:block text-center mt-6">
          <Button 
            onClick={handleBookCall}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-16 rounded-lg text-2xl transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
          >
            <Calendar className="mr-2 h-6 w-6" />
            FREE Strategy Call
          </Button>
        </div>

        {/* Aesthetic Divider after Desktop Calculator */}
        <div className="hidden lg:block w-full my-12">
          <div className="flex items-center justify-center">
            <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
            <div className={`mx-6 text-3xl ${isDarkMode ? 'text-white/40' : 'text-gray-600/50'}`}>⬢</div>
            <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
          </div>
        </div>

        {/* Mobile Layout - Always Light Mode */}
        <div className="lg:hidden max-w-4xl mx-auto mb-16">
          {/* Calculator Section */}
          <div id="calculator">
            <Card className="backdrop-blur-lg border-none shadow-2xl rounded-3xl overflow-hidden mb-8 bg-white">
              <CardContent className="p-8">
                {/* Sell Units - Primary Input */}
                <div className="mb-8 text-center">
                  <label className="text-foreground text-lg font-bold mb-4 block font-spartan">Units to Sell</label>
                  <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-12 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                      onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Input
                       type="number"
                       value={sellUnits}
                       onChange={(e) => setSellUnits(Math.max(1, parseInt(e.target.value) || 0))}
                       min="1"
                       className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-bold text-5xl rounded-xl h-24 text-center transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     />
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-12 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                      onClick={() => setSellUnits(sellUnits + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Two Column Layout for Other Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Type */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-7 border-border rounded-xl shadow-xl">
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Senior Living">Senior Living</SelectItem>
                        <SelectItem value="Plots">Plots</SelectItem>
                        <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Launch Type */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Launch Type</label>
                    <Select value={launchType} onValueChange={setLaunchType}>
                      <SelectTrigger className="bg-background text-7 border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                        <SelectItem value="Teaser">Teaser</SelectItem>
                        <SelectItem value="Launch">Launch</SelectItem>
                        <SelectItem value="Sustenance">Sustenance</SelectItem>
                        <SelectItem value="NRI">NRI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl max-h-60">
                        <SelectItem value="Bangalore East">Bangalore East</SelectItem>
                        <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                        <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                        <SelectItem value="Bangalore West">Bangalore West</SelectItem>
                        <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                        <SelectItem value="Chennai East">Chennai East</SelectItem>
                        <SelectItem value="Chennai North">Chennai North</SelectItem>
                        <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                        <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                        <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                        <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                        <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Configuration */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Configuration</label>
                    <Select value={bhk} onValueChange={setBhk}>
                      <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                        <SelectItem value="1 RK">1 RK</SelectItem>
                        <SelectItem value="1 BHK">1 BHK</SelectItem>
                        <SelectItem value="2 BHK">2 BHK</SelectItem>
                        <SelectItem value="3 BHK">3 BHK</SelectItem>
                        <SelectItem value="4 BHK">4 BHK</SelectItem>
                        <SelectItem value="5 BHK">5 BHK</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Marketing Channels */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Marketing Channels</label>
                    <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                      <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                        <SelectItem value="Google">Google Ads</SelectItem>
                        <SelectItem value="Meta">Meta Ads</SelectItem>
                        <SelectItem value="G+M">Google Ads+Meta Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                        <SelectItem value="15 Days">15 Days</SelectItem>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                        <SelectItem value="2 Months">2 Months</SelectItem>
                        <SelectItem value="3 Months">3 Months</SelectItem>
                        <SelectItem value="4 Months">4 Months</SelectItem>
                        <SelectItem value="5 Months">5 Months</SelectItem>
                        <SelectItem value="6 Months">6 Months</SelectItem>
                        <SelectItem value="7 Months">7 Months</SelectItem>
                        <SelectItem value="8 Months">8 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* View Results Button with Loading Animation */}
                <div className="text-center mt-8 relative">
                  <Button
                    onClick={handleViewResults}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {resultsUnlocked ? "Results Unlocked" : "Visualize Your Growth"}
                  </Button>
                  
                  {/* Loading Animation - Separate from Button */}
                  {isViewResultsLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                      <div className="flex items-center space-x-2 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-6 border-t border-border mt-6 font-spartan">
                  <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aesthetic Divider between Mobile Calculator and Results - Mobile Only */}
          <div className=" sm:hidden lg:hidden w-full my-8">
            <div className="flex items-center justify-center">
              <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
              <div className={`mx-4 text-xl ${isDarkMode ? 'text-white/40' : 'text-gray-600/50'}`}>◊</div>
              <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
            </div>
          </div>

          {/* Mobile Results Section - Always Light Mode */}
          <div id="results-section-mobile" className="relative">
            {!resultsUnlocked && (
              <div className="absolute inset-0 z-20 blur-overlay rounded-2xl"></div>
            )}
            
            <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
              {/* Mobile Metrics Cards - Single Line */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl text-center card-hover bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Leads</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPL: ₹{metrics.cpl.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-primary font-spartan">{metrics.leads.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl text-center card-hover bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Qualified Leads</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPQL: ₹{metrics.cpql.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-secondary font-spartan">{metrics.qualifiedLeads.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl text-center card-hover bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Site Visits</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPSV: ₹{metrics.cpsv.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-accent font-spartan">{metrics.siteVisits.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl text-center card-hover bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Bookings</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPB: ₹{(metrics.cpb / 100000).toFixed(2)}L</div>
                    </div>
                    <div className="text-5xl font-bold text-purple-brand font-spartan">{metrics.bookings}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Total Budget */}
              <Card className="backdrop-blur-lg border-none shadow-2xl rounded-2xl card-hover mb-8 bg-gradient-to-r from-primary to-secondary text-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2 font-spartan">
                      ₹{metrics.totalBudget.toLocaleString('en-IN')}
                    </div>
                    <div className="text-lg opacity-90 font-spartan">
                      Total Budget Required
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 justify-center mb-8">
                <Button 
                  onClick={handleBookCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule a Call
                </Button>
              </div>

              {/* Enhanced Charts */}
              <EnhancedCharts 
                metrics={metrics} 
                chartData={chartData} 
                duration={duration} 
              />
            </div>
          </div>
        </div>

        {/* Unlock Results Dialog */}
        {showUnlockDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in bg-white">
              <CardHeader className="relative">
                <Button
                  onClick={() => setShowUnlockDialog(false)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-2xl font-bold text-center font-spartan text-black">Unlock Your Results</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
              {!formData.name || !formData.mobile || !formData.email || !formData.organization ? (
      <div className="flex flex-col items-center justify-center space-y-4 py-10 animate-fadeIn">
      {/* 👇 Replace spinner with GIF here */}
      <img
        src="./lovable-uploads/amicat-wow.gif"
        alt="Loading..."
        className="w-20 h-20 object-contain"
      />
        <div className="text-gray-600 font-spartan text-base text-center">
          We’re getting everything ready for you...
          <br/>
          Untill Then Please Fill the Form
        </div>
      </div>
    ) : null}

                <div className="space-y-4">
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Phone Number"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your Email"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Your Organization/Project/Website"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Button
                    onClick={handleUnlockResults}
                    disabled={!formData.name || !formData.mobile || !formData.email || !formData.organization || isUnlockLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
                  >
                    {isUnlockLoading ? "Unlocking..." : "Unlock Calculator"}
                  </Button>
                  
                  {/* Loading Bar Animation */}
                  {isUnlockLoading && (
                    <div className="mt-4">
                      <div className="text-sm text-center mb-2 font-spartan text-gray-600">
                        Calculating your results...
                      </div>
                      <div className="w-full rounded-full h-2 bg-gray-200">
                        <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{ width: '100%', animation: 'loading 2s ease-in-out' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in bg-white">
              <CardHeader className="relative">
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-2xl font-bold text-center font-spartan text-black">Want A Call Back</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Phone Number"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your Email"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Your Organization"
                    className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                  />
                  <Button
                    onClick={handleUnlockResults}
                    disabled={!formData.name || !formData.mobile || !formData.email || !formData.organization || isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Aesthetic Divider before Clients Section */}
        <div className="sm:hidden w-full my-16">
          <div className="flex items-center justify-center">
            <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
            <div className={`mx-6 text-4xl ${isDarkMode ? 'text-white/40' : 'text-white/50'}`}>✧</div>
            <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
          </div>
        </div>

        <div id="clients" className="w-full px-4 md:px-10 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-spartan">
              Trusted by Performance-Driven Brands
            </h2>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 place-items-center">
            {Array.from({ length: 36 }, (_, i) => (
              <div 
                key={i}
                className="group p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 h-20 w-28 flex items-center justify-center filter grayscale hover:grayscale-0"
              >
                <img
                  src={`./client-logo/logo-${i + 1}.png`}
                  alt={`Client Logo ${i + 1}`}
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>

          {/* Mobile Infinite Scroll */}
          <div className="md:hidden overflow-hidden whitespace-nowrap px-2 py-4">
            <div className="inline-flex space-x-4 animate-scroll-slow">
              {[...Array(2)].flatMap(() => (
                Array.from({ length: 37 }, (_, i) => (
                  <div 
                    key={`loop-${i}-${Math.random()}`}
                    className="p-3 bg-white rounded-lg shadow-md h-16 w-20 flex items-center justify-center filter grayscale"
                  >
                    <img
                      src={`./client-logo/logo-${i + 1}.png`}
                      alt={`Client Logo ${i + 1}`}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>       
        
        {/* Mobile Sticky CTA */}
        <div className={`md:hidden sticky-cta transition-all duration-300 ${hideStickyCTA ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'}`}>
          <Button 
            onClick={handleBookCall}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 shadow-2xl font-spartan font-bold"
          >
            <Phone className="mr-2 h-4 w-4" />
            Ready to Grow? Let's Talk 🚀
          </Button>
        </div>
      </div>

      {/* Aesthetic Divider before Footer */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-center">
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
          <div className={`mx-6 text-3xl ${isDarkMode ? 'text-white/40' : 'text-gray-600/50'}`}>❋</div>
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
        </div>
      </div>

      {/* CTA Footer */}
      <div id="footer" className="bg-white text-accent-black py-8 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 font-spartan">Ready to Grow? Let's Talk 🚀</h3>
          <Button 
            onClick={handleBookCall}
            className=" bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
          >
            <Phone className=" mr-2 h-5 w-5" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadCalculator;
