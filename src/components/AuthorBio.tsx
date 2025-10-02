import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Award, Briefcase, CheckCircle } from 'lucide-react';

interface AuthorBioProps {
  name: string;
  title: string;
  bio: string;
  credentials: string[];
  experience: string;
  expertise: string[];
  email: string;
  profileUrl?: string;
  avatarUrl?: string;
  className?: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  name,
  title,
  bio,
  credentials,
  experience,
  expertise,
  email,
  profileUrl,
  avatarUrl,
  className = ''
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold text-foreground mb-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3" />
              <span>{experience}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {bio}
        </p>

        {/* Credentials - E-E-A-T */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Credentials</h4>
          </div>
          <div className="space-y-2">
            {credentials.map((credential, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{credential}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expertise Areas */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Areas of Expertise
          </h4>
          <div className="flex flex-wrap gap-2">
            {expertise.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t flex items-center justify-between">
          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contact {name.split(' ')[0]}</span>
          </a>
          
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer author"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Full Profile →
            </a>
          )}
        </div>
      </CardContent>

      {/* Schema.org markup for E-E-A-T */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": name,
          "jobTitle": title,
          "description": bio,
          "email": email,
          "url": profileUrl,
          "hasCredential": credentials.map(cred => ({
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": cred
          })),
          "knowsAbout": expertise
        })}
      </script>
    </Card>
  );
};
