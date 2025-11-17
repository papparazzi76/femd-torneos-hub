import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Loader2
} from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || formData.name.length > 100) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido y debe tener menos de 100 caracteres',
        variant: 'destructive'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un email válido',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.message.trim() || formData.message.length > 1000) {
      toast({
        title: 'Error',
        description: 'El mensaje es requerido y debe tener menos de 1000 caracteres',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: '¡Mensaje enviado!',
        description: 'Nos pondremos en contacto contigo pronto.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+34 XXX XXX XXX',
      link: 'tel:+34XXXXXXXXX'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@femdtorneos.com',
      link: 'mailto:info@femdtorneos.com'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      content: 'Aranda de Duero, Burgos, España',
      link: 'https://maps.google.com/?q=Aranda+de+Duero,Burgos,España'
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: 'Facebook',
      url: 'https://facebook.com',
      color: 'hover:text-blue-600'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com',
      color: 'hover:text-pink-600'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com',
      color: 'hover:text-blue-400'
    },
    {
      icon: Youtube,
      name: 'YouTube',
      url: 'https://youtube.com',
      color: 'hover:text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-emerald-600" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Contacto
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Card className="border-2 hover:border-emerald-600/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Send className="w-6 h-6 text-emerald-600" />
                  Envíanos un mensaje
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre completo *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre"
                        required
                        maxLength={100}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        required
                        maxLength={255}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Teléfono
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+34 XXX XXX XXX"
                        maxLength={20}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Asunto
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Tema de consulta"
                        maxLength={200}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensaje *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe tu mensaje aquí..."
                      required
                      maxLength={1000}
                      rows={6}
                      className="w-full resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.message.length}/1000 caracteres
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Social Media */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Contact Information */}
            <Card className="border-2 hover:border-emerald-600/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <a
                    key={index}
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="p-3 bg-emerald-600/10 rounded-lg group-hover:bg-emerald-600/20 transition-colors">
                      <info.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{info.title}</h3>
                      <p className="text-sm text-muted-foreground">{info.content}</p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="border-2 hover:border-emerald-600/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Síguenos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mantente conectado con nosotros en redes sociales
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-105 ${social.color}`}
                    >
                      <social.icon className="w-8 h-8" />
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="border-2 hover:border-emerald-600/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm font-medium">Lunes - Viernes</span>
                  <span className="text-sm text-muted-foreground">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm font-medium">Sábado</span>
                  <span className="text-sm text-muted-foreground">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Domingo</span>
                  <span className="text-sm text-muted-foreground">Cerrado</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Card className="overflow-hidden border-2 hover:border-emerald-600/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                Nuestra Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-muted relative overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47556.91524724!2d-3.7049!3d41.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd443e6b3dfe7d7f%3A0x408a0efb42a44b0!2sAranda%20de%20Duero%2C%20Burgos!5e0!3m2!1ses!2ses!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
