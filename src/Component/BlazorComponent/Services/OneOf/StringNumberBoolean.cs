﻿using OneOf;

namespace BlazorComponent
{
    public class StringNumberBoolean : OneOfBase<string, int, bool>
    {
        StringNumberBoolean(OneOf<string, int, bool> _) : base(_) { }

        public static implicit operator StringNumberBoolean(string _) => new(_);
        public static implicit operator StringNumberBoolean(int _) => new(_);
        public static implicit operator StringNumberBoolean(bool _) => new(_);

        public static bool operator ==(StringNumberBoolean left, StringNumberBoolean right)
        {
            if (Equals(left, right))
            {
                return true;
            }

            if (left is null || right is null)
            {
                return false;
            }

            return left.Value == right.Value;
        }

        public static bool operator !=(StringNumberBoolean left, StringNumberBoolean right)
        {
            if (Equals(left, right))
            {
                return false;
            }

            if (left is null || right is null)
            {
                return true;
            }

            return left.Value != right.Value;
        }

        public int ToInt32() => Match(
            t0 => Convert.ToInt32(t0),
            t1 => t1,
            t2 => 0
            );

        public override bool Equals(object obj)
        {
            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public override string ToString()
        {
            return Convert.ToString(Value);
        }
    }
}
