import { 
  Layers, 
  FileText, 
  Upload, 
  Calendar, 
  Workflow, 
  AlertTriangle, 
  Link as LinkIcon, 
  BarChart 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface ContentManagerSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationGroups = [
  {
    label: 'Content Creation',
    items: [
      { id: 'cluster', title: 'Cluster Mode', icon: Layers },
      { id: 'blog', title: 'Blog Manager', icon: FileText },
      { id: 'import', title: 'Bulk Import', icon: Upload },
    ],
  },
  {
    label: 'Publishing',
    items: [
      { id: 'scheduled', title: 'Scheduled', icon: Calendar },
    ],
  },
  {
    label: 'Optimization',
    items: [
      { id: 'funnel', title: 'Funnel Overview', icon: Workflow },
      { id: 'bottlenecks', title: 'Fix Bottlenecks', icon: AlertTriangle },
      { id: 'links', title: 'Manual Linking', icon: LinkIcon },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', title: 'Analytics', icon: BarChart },
    ],
  },
];

export function ContentManagerSidebar({ activeView, onViewChange }: ContentManagerSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onViewChange(item.id)}
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
