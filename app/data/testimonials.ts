export type Testimonial = {
  name: string;
  quote: string;
  /** Unique seed for avatar (numeric = distinct face on most services) */
  avatarSeed: string;
};

export const testimonials: Testimonial[] = [
  { name: 'Sarah M.', quote: "I was so lost after the forex thing. Having one place where I could see my balance and actually talk to someone who knew my case—it made a real difference.", avatarSeed: '101' },
  { name: 'James K.', quote: "The emails when something happens are great. I got notified when my deposit landed and when the withdrawal went through. No guessing.", avatarSeed: '102' },
  { name: 'Alex T.', quote: "Dashboard's simple. I put in a withdrawal request, they got back to me, and the process was clear. Support actually replied.", avatarSeed: '103' },
  { name: 'Maria S.', quote: "Honestly I didn't trust anything after what happened. This felt different—real person, real updates. I could track everything.", avatarSeed: '104' },
  { name: 'David C.', quote: "Got my BTC address and the QR code in an email. Topped up, balance updated. Straightforward.", avatarSeed: '105' },
  { name: 'Emma W.', quote: "I'd tried another service before and it was a mess. Here the verification was quick and my manager actually answered within a day.", avatarSeed: '106' },
  { name: 'Michael B.', quote: "They said I'd get the funds and I did. No drama. Withdrawal approved, money arrived. That's what I needed.", avatarSeed: '107' },
  { name: 'Lisa A.', quote: "Uploaded my ID, got verified. Sounds boring but after what I'd been through, having it go smoothly meant a lot.", avatarSeed: '108' },
  { name: 'Robert T.', quote: "Thought my crypto was just gone. This gave me a way to see what was happening and someone to ask when I was stuck.", avatarSeed: '109' },
  { name: 'Jennifer L.', quote: "No nasty surprises. Everything was clear from the start—what I had, what I could do. Refreshing.", avatarSeed: '110' },
  { name: 'Chris D.', quote: "I like that they email you for everything. Deposit confirmed, withdrawal submitted. So you're never wondering.", avatarSeed: '111' },
  { name: 'Amanda M.', quote: "My manager knew my situation. I didn't have to explain it every time. She just got it and could help.", avatarSeed: '112' },
  { name: 'Daniel W.', quote: "Recovery's overwhelming. This broke it into steps and kept me in the loop. Felt manageable.", avatarSeed: '113' },
  { name: 'Rachel G.', quote: "Signed up, verified, had my BTC address the same day. Way faster than I thought it would be.", avatarSeed: '114' },
  { name: 'Kevin P.', quote: "Opened a support ticket and got a real reply. Not a bot. That's rare these days.", avatarSeed: '115' },
  { name: 'Nicole C.', quote: "ID upload was easy. Whole thing felt professional. After getting scammed, that mattered to me.", avatarSeed: '116' },
  { name: 'Steven W.', quote: "From day one to my first withdrawal, I could see where things stood. No black box.", avatarSeed: '117' },
  { name: 'Olivia H.', quote: "I was sceptical. But it did what it said—clear dashboard, real support. Withdrawal came through.", avatarSeed: '118' },
  { name: 'Thomas K.', quote: "Binary options mess. Didn't know where to start. This gave me structure and a path forward.", avatarSeed: '119' },
  { name: 'Sophie T.', quote: "Deposit went in, balance updated. Simple. You'd think that's standard but it isn't everywhere.", avatarSeed: '120' },
  { name: 'William S.', quote: "No runaround. When I had a question I got a straight answer. Real people.", avatarSeed: '121' },
  { name: 'Jessica A.', quote: "I'd tell anyone in the same boat to try this. First platform that actually felt like it was for people like us.", avatarSeed: '122' },
  { name: 'Matthew H.', quote: "Saw the numbers on the site. Thought it was marketing. Then my withdrawal got approved and I got paid. So yeah, it's real.", avatarSeed: '123' },
  { name: 'Lauren B.', quote: "Quick verification, clear dashboard, support that answers. Exactly what I needed after losing money.", avatarSeed: '124' },
];
