import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/': 'TaxLegalPro — Tax, legal and corporate',
  '/services': 'Services — TaxLegalPro',
  '/pricing': 'Pricing — TaxLegalPro',
  '/about': 'About — TaxLegalPro',
  '/contact': 'Contact — TaxLegalPro',
  '/consultation': 'Book a consultation — TaxLegalPro',
  '/faq': 'FAQ — TaxLegalPro',
  '/resources': 'Resources — TaxLegalPro',
  '/login': 'Client login — TaxLegalPro',
  '/register': 'Create account — TaxLegalPro',
  '/privacy': 'Privacy policy — TaxLegalPro',
  '/terms': 'Terms of use — TaxLegalPro',
  '/refund-policy': 'Refund policy — TaxLegalPro',
  '/app': 'Admin — TaxLegalPro',
  '/portal': 'Client portal — TaxLegalPro',
}

const DESCRIPTION =
  'TaxLegalPro advises individuals and businesses on tax, legal, corporate, trademark, and compliance work across Pakistan.'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

export function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const base = TITLES[pathname] ?? TITLES[`/${pathname.split('/')[1]}`] ?? 'TaxLegalPro'
    const title = pathname.startsWith('/app')
      ? 'Admin — TaxLegalPro'
      : pathname.startsWith('/portal')
        ? 'Client portal — TaxLegalPro'
        : base
    document.title = title
    upsertMeta('name', 'description', DESCRIPTION)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', DESCRIPTION)
    upsertMeta('name', 'robots', pathname.startsWith('/app') || pathname.startsWith('/portal') ? 'noindex,nofollow' : 'index,follow')

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `${window.location.origin}${pathname}`
  }, [pathname])

  return null
}
