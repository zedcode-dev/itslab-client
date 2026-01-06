// ============================================================================
// SRC/APP/STUDENT/CERTIFICATES/PAGE.TSX - Student Certificates (CLASSIC PREMIUM UI)
// ============================================================================

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Calendar, ExternalLink, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useStudentCertificates } from '@/hooks/use-api';

export default function CertificatesPage() {
  const { data, isLoading } = useStudentCertificates();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-1/4"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-muted rounded-[2rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Achievements 🏆</h1>
          <p className="text-muted-foreground">Verification of your hard-earned skills and completed courses.</p>
        </div>
      </div>

      {data?.certificates && data.certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.certificates.map((cert: any) => (
            <Card key={cert.id} className="group relative rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card overflow-hidden">
              <CardContent className="p-8">
                {/* Decorative Background Icon */}
                <Award className="absolute -top-6 -right-6 w-32 h-32 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-yellow-100">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {cert.course?.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">
                    <Calendar className="w-4 h-4" />
                    <span>Issued {formatDate(cert.issued_date)}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-8">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Verify ID</div>
                    <div className="text-xs font-mono font-medium truncate opacity-60">{cert.certificate_id}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                        <Download className="w-4 h-4" />
                        Save
                      </Button>
                    </a>
                    <Button variant="outline" className="h-12 rounded-xl font-bold gap-2 border-2 transition-all hover:bg-secondary">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-32 rounded-[3.5rem] border-2 border-dashed border-border/50 bg-card/30 shadow-none">
          <CardContent>
            <div className="w-24 h-24 rounded-[2rem] bg-yellow-50 mx-auto mb-8 flex items-center justify-center border border-yellow-100">
              <Award className="w-12 h-12 text-yellow-600 opacity-30" />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tight">No achievements yet</h3>
            <p className="text-muted-foreground mb-10 max-w-sm mx-auto text-lg leading-relaxed">
              Complete your first course to unlock your official verification certificate!
            </p>
            <Link href="/student/courses">
              <Button size="lg" className="rounded-[1.5rem] px-12 h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                Go to My Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
