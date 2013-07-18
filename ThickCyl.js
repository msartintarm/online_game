define("ThickCyl", ["Disk", "Cyl"], function() {

/**
   ThickCyl. 
 */
function ThickCyl(inner_radius, width, height, slices, stacks) { 
    this.objs = [];

    this.topDisk = this.Disk(
	inner_radius, inner_radius + width, slices, stacks).invertNorms();
    this.bottomDisk = this.Disk(
	inner_radius, inner_radius + width, slices, stacks).translate([0, 0, height]);
    this.innerCyl = this.Cyl(
	inner_radius, inner_radius, height, slices, stacks).invertNorms();
    this.outerCyl = this.Cyl(
	inner_radius + width, inner_radius + width, height, slices, stacks);
    this.outerCyl.wrapText();

    return this;
}

ThickCyl.prototype.wrapTexture = function(the_texture, the_shader) {
    this.outerCyl.wrapTexture(the_texture);
    if(the_shader) this.outerCyl.setShader(the_shader);
}

ThickCyl.prototype.Disk = _Disk;
ThickCyl.prototype.Cyl = _Cyl;
ThickCyl.prototype.rotatePos = _objsRotatePos;
ThickCyl.prototype.rotateNeg = _objsRotateNeg;
ThickCyl.prototype.flip = _objsFlip;
ThickCyl.prototype.scale = _objsScale;
ThickCyl.prototype.translate = _objsTranslate;
ThickCyl.prototype.initBuffers = _objsInitBuffers;
ThickCyl.prototype.draw = _objsDraw;

});
