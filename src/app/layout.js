import { Inter, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import LenisSmoothScroll from "../components/Animations/Lenis";
import Loader from "../components/Loader/Loader";
import { LoaderProvider } from "../components/Loader/LoaderContext";
import Navbar from "@/components/Navbar/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"], 
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ppNeueMontreal = localFont({ 
  src: [
    {
      path: "../fonts/ppneuemontreal-thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/ppneuemontreal-book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ppneuemontreal-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/ppneuemontreal-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pp-neue",
  display: "swap",
});

export const metadata = {
  title: "Verdikt Studio",
  description: "Verdikt Studio is a web development studio that specializes in creating custom websites and web applications for businesses and organizations.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${ppNeueMontreal.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col font-sans">
        <LoaderProvider> 
          <LenisSmoothScroll />
          <Loader />
          <Navbar />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}
