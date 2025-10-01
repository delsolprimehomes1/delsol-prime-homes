import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Mail, ExternalLink } from 'lucide-react';
import { AuthorCredentialsSchema } from '@/components/AuthorCredentialsSchema';

interface BlogAuthorBioProps {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  credentials?: string[];
  expertise?: string[];
  experience?: string;
  profileUrl?: string;
  email?: string;
  articleUrl?: string;
  className?: string;
}

export const BlogAuthorBio: React.FC<BlogAuthorBioProps> = ({
  name,
  title,
  bio,
  avatarUrl,
  credentials = [],
  expertise = [],
  experience = '',
  profileUrl,
  email,
  articleUrl,
  className = ''
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {credentials.length > 0 && expertise.length > 0 && (
        <AuthorCredentialsSchema
          author={{
            name,
            title,
            credentials,
            experience: experience || bio,
            expertise,
            profileUrl,
          }}
          articleUrl={articleUrl}
        />
      )}
      
      <Card className={`p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            About the Author
          </h3>
          <Badge variant="secondary" className="ml-auto">
            Expert Verified
          </Badge>
        </div>
        
        <div className="flex gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{name}</h4>
            <p className="text-sm text-primary mb-2">{title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {bio}
            </p>
            
            {credentials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {credentials.slice(0, 3).map((credential, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {credential}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 text-sm">
              {email && (
                <a 
                  href={`mailto:${email}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
              )}
              {profileUrl && (
                <a 
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Profile</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default BlogAuthorBio;
