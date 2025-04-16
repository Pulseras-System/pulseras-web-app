import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="py-12 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Pulsera</h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Discover our handcrafted bracelets and accessories made with love
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link to="/product-list">Shop Now</Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle>Product {item}</CardTitle>
                <CardDescription>Beautiful handcrafted bracelet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-md mb-4"></div>
                <p className="font-medium">$29.99</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* About section */}
      <section className="py-8 bg-muted/40 rounded-lg p-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">About Pulsera</h2>
          <p className="text-muted-foreground">
            We create unique, handcrafted bracelets made with high-quality materials.
            Each piece is carefully designed to bring joy and style to your everyday life.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
