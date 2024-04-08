export function vec2(x,y) {
    this.length = function()
    {
        return Math.sqrt((this.x * this.x) + (this.y*this.y));
    }
    this.normalize = function()
    {
        let scale = this.length();
        this.x /= scale;
        this.y /= scale;
    }
    
    this.sub = function(other)
    {
        let x = this.x - other.x;
        let y = this.y - other.y;
        return new vec2(x, y);
    }
    this.add = function(other)
    {
        let x = this.x + other.x;
        let y = this.y + other.y;
        return new vec2(x, y);
    }
    this.scale = function(factor)
    {
        let x = this.x * factor;
        let y = this.y * factor;
        return new vec2(x, y);
    }
    this.x = x;
    this.y = y;
}